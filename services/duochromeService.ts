import { DuochromeResult, Severity } from '../types';

export type DuochromeUserInput = 'red' | 'green' | 'equal';

export class DuochromeTestService {
  private startTime: number = 0;

  startTest(): void {
    this.startTime = Date.now();
  }

  calculateResult(selection: DuochromeUserInput): DuochromeResult {
    let result: DuochromeResult['result'] = 'normal';
    let severity: Severity = 'NONE';
    let details = "Các ký tự trên cả hai nền đỏ và xanh lá cây đều rõ nét như nhau.";

    switch (selection) {
      case 'red':
        result = 'myopic'; // Cận thị
        severity = 'LOW';
        details = "Các ký tự trên nền đỏ rõ nét hơn, có thể là dấu hiệu của cận thị hoặc điều chỉnh kính quá mức.";
        break;
      case 'green':
        result = 'hyperopic'; // Viễn thị
        severity = 'LOW';
        details = "Các ký tự trên nền xanh lá cây rõ nét hơn, có thể là dấu hiệu của viễn thị hoặc điều chỉnh kính chưa đủ.";
        break;
      case 'equal':
        // Defaults are already set for this case
        break;
    }

    return {
      result,
      severity,
      details,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}