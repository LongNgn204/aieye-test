import { SnellenResult, VisionScore } from '../types';

interface SnellenQuestion {
  level: number;
  size: number;
  rotation: 0 | 90 | 180 | 270;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export class SnellenTestService {
  private readonly totalQuestions = 20;
  private questions: SnellenQuestion[] = [];
  private answers: boolean[] = [];
  private startTime: number = 0;

  startTest(): SnellenQuestion[] {
    this.startTime = Date.now();
    this.questions = [];
    this.answers = [];

    let potentialQuestions: SnellenQuestion[] = [];
    for (let i = 0; i < this.totalQuestions; i++) {
        potentialQuestions.push({
            level: i + 1,
            size: this.calculateSize(i + 1),
            rotation: this.randomRotation(),
        });
    }

    this.questions = shuffleArray(potentialQuestions);
    return this.questions;
  }

  submitAnswer(questionIndex: number, userRotation: number): boolean {
    const correct = this.questions[questionIndex].rotation === userRotation;
    this.answers[questionIndex] = correct;
    return correct;
  }

  calculateResult(): SnellenResult {
    const correctCount = this.answers.filter(Boolean).length;
    const accuracy = (correctCount / this.totalQuestions) * 100;
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    return {
      score: this.getVisionScore(correctCount),
      accuracy: Math.round(accuracy),
      correctAnswers: correctCount,
      totalQuestions: this.totalQuestions,
      duration,
      date: new Date().toISOString(),
    };
  }

  private calculateSize(level: number): number {
    // Adjusted scaling for 20 questions
    return Math.max(16, 120 - (level * 5));
  }

  private randomRotation(): 0 | 90 | 180 | 270 {
    const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
    return rotations[Math.floor(Math.random() * 4)];
  }

  private getVisionScore(correctCount: number): VisionScore {
    if (correctCount >= 18) return '20/20';   // >= 90%
    if (correctCount >= 14) return '20/30';  // >= 70%
    if (correctCount >= 10) return '20/40';  // >= 50%
    if (correctCount >= 6) return '20/60';   // >= 30%
    return '20/100'; // < 30%
  }
}