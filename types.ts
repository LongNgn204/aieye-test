export type VisionScore = '20/20' | '20/30' | '20/40' | '20/60' | '20/100';
export type Severity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type TestType = 'snellen' | 'colorblind' | 'astigmatism' | 'amsler' | 'duochrome';

export interface UserProfile {
  name: string;
  age: string;
  phone: string;
}

export interface SnellenResult {
  score: VisionScore;
  accuracy: number; // 0-100
  correctAnswers: number;
  totalQuestions: number;
  duration: number; // seconds
  date: string;
}

export interface ColorBlindResult {
  correct: number;
  total: number;
  accuracy: number;
  missedPlates: { plate: number; correctAnswer: string; userAnswer: string }[];
  type: 'Normal' | 'Red-Green Deficiency' | 'Possible Total Color Blindness';
  severity: Severity;
  date: string;
  duration: number;
}

export interface AstigmatismResult {
  hasAstigmatism: boolean;
  severity: Severity;
  details: string;
  date: string;
  duration: number;
}

export interface AmslerGridResult {
  issueDetected: boolean;
  severity: Severity;
  details: string; // e.g., "Wavy lines in upper-left quadrant."
  date: string;
  duration: number;
}

export interface DuochromeResult {
  result: 'normal' | 'myopic' | 'hyperopic'; // Cận thị | Viễn thị | Bình thường
  severity: Severity;
  details: string; // e.g., "Characters on the red background appear clearer."
  date: string;
  duration: number;
}

export type TestResultData = SnellenResult | ColorBlindResult | AstigmatismResult | AmslerGridResult | DuochromeResult;

export interface AIAnalysis {
  ai: 'gemini' | 'minimax' | 'deepseek';
  weight: number;
  confidence: number;
  assessment: string;
  trend?: string;
  causes?: string;
  recommendations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  prediction?: string;
  responseTime: number; // ms
}

export interface AIReport {
  id: string;
  testType: TestType;
  confidence: number; // 0-100
  status: 'RELIABLE' | 'NEEDS_REVIEW';
  summary: string;
  trend?: string;
  causes?: string;
  recommendations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  prediction?: string;
  aiDetails: {
    gemini?: AIAnalysis;
    minimax?: AIAnalysis;
    deepseek?: AIAnalysis;
  };
  timestamp: string;
  totalResponseTime: number; // ms
}

// For storing in localStorage
export interface StoredTestResult {
    id: string;
    testType: TestType;
    date: string;
    resultData: TestResultData;
    report: AIReport;
}

// For Chatbot
export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}