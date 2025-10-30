import { AmslerGridResult, Severity } from '../types';

export class AmslerGridTestService {
  private startTime: number = 0;

  startTest(): void {
    this.startTime = Date.now();
  }

  calculateResult(distortedAreas: string[]): AmslerGridResult {
    const issueDetected = distortedAreas.length > 0;
    let severity: Severity = 'NONE';
    let details = "Không phát hiện biến dạng trên lưới.";

    if (issueDetected) {
      if (distortedAreas.length > 5) {
        severity = 'HIGH';
      } else if (distortedAreas.length > 0) {
        severity = 'MEDIUM';
      }
      details = `Phát hiện biến dạng ở các khu vực: ${distortedAreas.join(', ')}.`;
    }

    return {
      issueDetected,
      severity,
      details,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}