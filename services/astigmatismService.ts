import { AstigmatismResult, Severity } from '../types';

export type AstigmatismUserInput = 'none' | 'vertical' | 'horizontal' | 'oblique';

export class AstigmatismTestService {
  private startTime: number = 0;

  startTest(): void {
    this.startTime = Date.now();
  }

  calculateResult(selection: AstigmatismUserInput): AstigmatismResult {
    const hasAstigmatism = selection !== 'none';
    let severity: Severity = 'NONE';
    let details = "Tất cả các vạch hiển thị rõ ràng và sắc nét như nhau.";

    if (hasAstigmatism) {
      severity = 'MEDIUM'; // Default for any detected issue
      switch (selection) {
        case 'vertical':
          details = "Các vạch dọc (hướng 6-12 giờ) có vẻ đậm hoặc rõ hơn các vạch ngang.";
          break;
        case 'horizontal':
          details = "Các vạch ngang (hướng 3-9 giờ) có vẻ đậm hoặc rõ hơn các vạch dọc.";
          break;
        case 'oblique':
          details = "Các vạch chéo có vẻ đậm hoặc rõ hơn các vạch khác.";
          break;
      }
    }

    return {
      hasAstigmatism,
      severity,
      details,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}