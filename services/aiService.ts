import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, AIReport, TestType } from '../types';

// Simplified config, now Gemini-only
const AI_CONFIG = {
  gemini: { 
    model: 'gemini-2.5-pro',
    temperature: 0.3, // Slightly higher for more descriptive text
    maxTokens: 1024 // Increased to allow for longer reports
  },
};

// Define the schema for a more reliable JSON response from Gemini
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        confidence: { type: Type.NUMBER, description: "Confidence level of the analysis, from 0.85 to 0.98." },
        assessment: { type: Type.STRING, description: "A detailed, comprehensive assessment (100-150 words) of the vision status in Vietnamese. Explain the meaning of the results in practical, easy-to-understand terms." },
        causes: { type: Type.STRING, description: "A brief analysis (30-50 words) of the most common potential causes for the vision status in Vietnamese." },
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-4 specific, actionable recommendations in Vietnamese. The last recommendation MUST ALWAYS be to consult a professional ophthalmologist."
        },
        severity: { type: Type.STRING, description: "Severity level: LOW, MEDIUM, or HIGH." },
        prediction: { type: Type.STRING, description: "A short prediction (20-40 words) of the condition if left untreated in Vietnamese." },
    },
    required: ["confidence", "assessment", "recommendations", "severity", "causes", "prediction"]
};


export class ConsensusService {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateReport(testType: TestType, testData: any): Promise<AIReport> {
    const startTime = Date.now();
    const prompt = this.createPrompt(testType, testData);

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
      
      const text = response.text;
      if (!text) {
        console.error("Gemini API returned an empty response.", response);
        throw new Error("Gemini analysis returned no content. This might be due to a safety block.");
      }
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(text.trim());
      } catch (e) {
        console.error("Failed to parse JSON response from Gemini.", text, e);
        throw new Error("Failed to parse JSON response from Gemini.");
      }

      const geminiAnalysis: AIAnalysis = {
        ai: 'gemini',
        weight: 1.0,
        ...analysisResult,
        responseTime: Date.now() - startTime
      };

      return {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        confidence: parseFloat((geminiAnalysis.confidence * 100).toFixed(2)),
        status: geminiAnalysis.confidence >= 0.90 ? 'RELIABLE' : 'NEEDS_REVIEW',
        summary: geminiAnalysis.assessment,
        recommendations: geminiAnalysis.recommendations,
        severity: geminiAnalysis.severity,
        trend: geminiAnalysis.trend,
        causes: geminiAnalysis.causes,
        prediction: geminiAnalysis.prediction,
        aiDetails: {
          gemini: geminiAnalysis,
        },
        timestamp: new Date().toISOString(),
        totalResponseTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Gemini API error during report generation:', error);
      throw new Error('Gemini analysis failed');
    }
  }
  
  private createPrompt(testType: TestType, data: any): string {
    const baseInstruction = `Bạn là một trợ lý chuyên gia nhãn khoa ảo. Nhiệm vụ của bạn là cung cấp một bản phân tích chi tiết, mang tính giáo dục và hữu ích về kết quả kiểm tra thị lực.
Hãy trả lời một cách chuyên nghiệp nhưng dễ hiểu cho người dùng phổ thông.
QUAN TRỌNG: Chỉ trả về một đối tượng JSON hợp lệ theo schema đã cho. KHÔNG thêm bất kỳ văn bản, giải thích, hoặc định dạng markdown nào khác.`;

    const dataString = JSON.stringify(data, null, 2);
    let specificInstruction = '';

    switch (testType) {
        case 'snellen':
            specificInstruction = `Phân tích kết quả kiểm tra thị lực Snellen sau. Trong phần 'assessment', hãy giải thích rõ ý nghĩa của điểm số (ví dụ: thị lực 20/40 có nghĩa là gì trong thực tế). Đề cập đến các tật khúc xạ phổ biến như cận thị, viễn thị. Trong phần 'recommendations', hãy đưa ra các lời khuyên cụ thể như quy tắc 20-20-20, điều chỉnh ánh sáng làm việc.`;
            break;
        case 'colorblind':
            specificInstruction = `Phân tích kết quả kiểm tra mù màu Ishihara. Trong phần 'assessment', hãy giải thích loại mù màu được phát hiện và nó ảnh hưởng đến việc nhận biết màu sắc hàng ngày như thế nào. Trong phần 'causes', hãy đề cập đến tính di truyền của tình trạng này. 'recommendations' có thể bao gồm các mẹo thực tế như sử dụng ứng dụng hỗ trợ màu sắc.`;
            break;
        case 'astigmatism':
            specificInstruction = `Phân tích kết quả kiểm tra loạn thị. Trong phần 'assessment', hãy giải thích một cách đơn giản loạn thị là gì (giác mạc không đều) và kết quả của người dùng cho thấy điều gì. 'recommendations' nên nhấn mạnh tầm quan trọng của việc khám mắt để có kính điều chỉnh phù hợp.`;
            break;
        case 'amsler':
            specificInstruction = `Phân tích kết quả kiểm tra Lưới Amsler. NHẤN MẠNH tầm quan trọng của bài kiểm tra này đối với sức khỏe điểm vàng. Trong phần 'assessment', hãy giải thích rằng bất kỳ sự biến dạng nào cũng có thể là dấu hiệu sớm của các bệnh nghiêm trọng về võng mạc. 'recommendations' phải cực kỳ nhấn mạnh việc cần phải đi khám bác sĩ nhãn khoa NGAY LẬP TỨC nếu phát hiện vấn đề.`;
            break;
        case 'duochrome':
            specificInstruction = `Phân tích kết quả kiểm tra Đỏ-Xanh (Duochrome). Giải thích nguyên lý cơ bản của bài kiểm tra (hiện tượng sắc sai). Trong 'assessment', hãy giải thích kết quả 'myopic' (cận thị/chỉnh quá) hoặc 'hyperopic' (viễn thị/chỉnh non) có ý nghĩa gì đối với độ kính hiện tại của người dùng. 'recommendations' nên đề nghị một cuộc hẹn với chuyên gia khúc xạ để kiểm tra lại độ kính.`;
            break;
        default:
            specificInstruction = `Phân tích dữ liệu thị lực sau.`;
    }

    return `${baseInstruction}\n\n**CONTEXT:**\n${specificInstruction}\n\n**USER DATA:**\n${dataString}`;
  }
}
