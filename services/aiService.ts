import { GoogleGenAI, Type } from "@google/genai";
import { AIReport, StoredTestResult, TestType, UserProfile } from '../types';

const AI_CONFIG = {
  gemini: { 
    model: 'gemini-2.5-pro',
    temperature: 0.4, // Slightly increased for more nuanced text
    maxTokens: 2048
  },
};

const createResponseSchema = (language: 'vi' | 'en') => {
    const langDescription = language === 'vi' ? 'in Vietnamese' : 'in English';
    return {
        type: Type.OBJECT,
        properties: {
            confidence: { type: Type.NUMBER, description: "Confidence level of the analysis, from 0.85 to 0.98." },
            summary: { type: Type.STRING, description: `A detailed, comprehensive assessment (100-150 words) of the vision status ${langDescription}. Explain the meaning of the results in practical, easy-to-understand terms.` },
            trend: { type: Type.STRING, description: `An analysis (40-60 words) of the trend compared to previous tests ${langDescription}. If no relevant history, this field should be a gentle encouragement to test regularly.` },
            causes: { type: Type.STRING, description: `A brief analysis (30-50 words) of the most common potential causes for the vision status ${langDescription}.` },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `A list of 3-4 specific, actionable recommendations ${langDescription}. The last recommendation MUST ALWAYS be to consult a professional ophthalmologist.`
            },
            severity: { type: Type.STRING, description: "Severity level: LOW, MEDIUM, or HIGH." },
            prediction: { type: Type.STRING, description: `A short prediction (20-40 words) of the condition if left untreated ${langDescription}.` },
        },
        required: ["confidence", "summary", "trend", "recommendations", "severity", "causes", "prediction"]
    };
};


export class AIService {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateReport(testType: TestType, testData: any, userProfile: UserProfile | null, history: StoredTestResult[], language: 'vi' | 'en'): Promise<AIReport> {
    const startTime = Date.now();
    const prompt = this.createPrompt(testType, testData, userProfile, history, language);
    const responseSchema = createResponseSchema(language);

    try {
      const response = await this.ai.models.generateContent({
        model: AI_CONFIG.gemini.model,
        contents: prompt,
        config: {
          temperature: AI_CONFIG.gemini.temperature,
          maxOutputTokens: AI_CONFIG.gemini.maxTokens,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        },
      });

      const text = response?.text;
      if (typeof text !== 'string' || text.trim() === '') {
        const blockReason = response?.candidates?.[0]?.finishReason;
        const safetyRatings = response?.candidates?.[0]?.safetyRatings;
        console.error("Gemini API returned empty or invalid content.", { blockReason, safetyRatings });
        throw new Error(`Gemini analysis returned no content. Reason: ${blockReason || 'Unknown'}`);
      }
      
      let analysisResult;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No valid JSON object found in Gemini's response.", text);
          throw new Error("No valid JSON object found in Gemini's response.");
        }
        analysisResult = JSON.parse(jsonMatch[0]);
      } catch (e: any) {
        console.error("Failed to parse JSON response from Gemini.", text, e);
        throw new Error(`Failed to parse JSON response from Gemini. Error: ${e.message}`);
      }


      return {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        timestamp: new Date().toISOString(),
        totalResponseTime: Date.now() - startTime,
        confidence: parseFloat((analysisResult.confidence * 100).toFixed(2)),
        summary: analysisResult.summary,
        causes: analysisResult.causes,
        recommendations: analysisResult.recommendations,
        severity: analysisResult.severity,
        prediction: analysisResult.prediction,
        trend: analysisResult.trend,
      };

    } catch (error) {
      console.error('Gemini API error during report generation:', error);
      throw new Error('Gemini analysis failed');
    }
  }
  
  private createPrompt(testType: TestType, data: any, userProfile: UserProfile | null, history: StoredTestResult[], language: 'vi' | 'en'): string {
    const langInstruction = language === 'vi' ? 'VIỆT NAM' : 'ENGLISH';
    const baseInstruction = `Bạn là một trợ lý AI thấu cảm và mang tính giáo dục, chuyên giải thích các kết quả kiểm tra thị lực.
    
QUAN TRỌNG:
1. NGÔN NGỮ PHẢN HỒI: PHẢI trả lời hoàn toàn bằng tiếng ${langInstruction}.
2. CÁ NHÂN HÓA: Hãy gọi tên người dùng (${userProfile?.name || 'bạn'}) trong phần tóm tắt. Cân nhắc độ tuổi (${userProfile?.age || 'không rõ'}) khi đưa ra lời khuyên.
3. PHÂN TÍCH XU HƯỚNG: So sánh KẾT QUẢ HIỆN TẠI với LỊCH SỬ KIỂM TRA để nhận xét về sự thay đổi. Nếu không có lịch sử liên quan, hãy khuyến khích kiểm tra thường xuyên.
4. KHÔNG CHẨN ĐOÁN: TUYỆT ĐỐI không đưa ra chẩn đoán. Vai trò của bạn là giải thích thông tin.
5. LUÔN KHUYÊN ĐI KHÁM BÁC SĨ: Khuyến nghị cuối cùng PHẢI LUÔN LÀ "Tham khảo ý kiến của bác sĩ nhãn khoa chuyên nghiệp để có chẩn đoán chính xác."
6. ĐỊNH DẠNG: Chỉ trả về một đối tượng JSON hợp lệ theo schema.`;

    const relevantHistory = history
        .filter(item => item.testType === testType)
        .slice(0, 3) // Get the last 3 relevant tests
        .map(item => ({ date: item.date, result: item.resultData }));

    const dataString = JSON.stringify(data, null, 2);
    const historyString = JSON.stringify(relevantHistory, null, 2);

    return `${baseInstruction}\n\n**USER PROFILE:**\nName: ${userProfile?.name}\nAge: ${userProfile?.age}\n\n**TEST HISTORY (for trend analysis):**\n${historyString}\n\n**CURRENT TEST DATA:**\n${dataString}`;
  }
}