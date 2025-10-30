import { StoredTestResult, TestResultData, AIReport } from '../types';

const HISTORY_KEY = 'aiVisionTestHistory';

export class StorageService {
  saveTestResult(resultData: TestResultData, report: AIReport): void {
    try {
      const history = this.getTestHistory();
      const newResult: StoredTestResult = {
        id: report.id,
        testType: report.testType,
        date: resultData.date,
        resultData,
        report,
      };
      history.unshift(newResult); // Add to the beginning
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Limit history to 50 entries
    } catch (error) {
      console.error("Failed to save test result to localStorage:", error);
    }
  }

  getTestHistory(): StoredTestResult[] {
    try {
      const historyJson = localStorage.getItem(HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("Failed to retrieve test history from localStorage:", error);
      return [];
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear history from localStorage:", error);
    }
  }
}