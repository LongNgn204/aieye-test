import { GoogleGenAI, Chat } from "@google/genai";
import { StoredTestResult, ChatMessage } from '../types';

export class ChatbotService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor(apiKey: string, history: StoredTestResult[]) {
    this.ai = new GoogleGenAI({ apiKey });
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: this.getSystemInstruction(history),
      },
    });
  }

  private getSystemInstruction(history: StoredTestResult[]): string {
    const baseInstructions = {
        role: "You are a virtual assistant specializing in vision health. Your task is to answer user questions in a friendly manner, provide helpful information, and explain test results.",
        rules: [
            "IMPORTANT: You MUST detect the language of the user's query (e.g., Vietnamese, English) and respond in that SAME language.",
            "Never give medical diagnoses. Always emphasize that you are an AI and the user should consult a professional ophthalmologist.",
            "Use the provided test history to answer questions related to the user's results.",
            "If asked about general eye health topics, provide accurate and general answers.",
            "Keep your answers concise and easy to understand."
        ],
        historyHeader: "Here is a summary of the user's test history (use only when asked):"
    };

    const historySummary = history.length > 0
      ? history.map(r => `- ${r.testType} on ${new Date(r.date).toLocaleDateString()}: ${r.report.summary}`).join('\n')
      : "No test history available.";

    return `${baseInstructions.role}\n\n**Rules:**\n- ${baseInstructions.rules.join('\n- ')}\n\n**${baseInstructions.historyHeader}**\n${historySummary}`;
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    try {
      const response = await this.chat.sendMessage({ message });
      return {
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Chatbot API error:", error);
      const errorMessage = "I'm sorry, I encountered an error. Please try again later.";
      return {
        sender: 'bot',
        text: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}