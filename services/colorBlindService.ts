import { ColorBlindResult, Severity } from '../types';

export interface Plate {
  id: number;
  correctAnswer: string;
}

const allPlates: Plate[] = [
  { id: 1, correctAnswer: '12' }, { id: 2, correctAnswer: '8' },
  { id: 3, correctAnswer: '29' }, { id: 4, correctAnswer: '5' },
  { id: 5, correctAnswer: '3' }, { id: 6, correctAnswer: '15' },
  { id: 7, correctAnswer: '74' }, { id: 8, correctAnswer: '6' },
  { id: 9, correctAnswer: '45' }, { id: 10, correctAnswer: '7' },
  { id: 11, correctAnswer: '16' }, { id: 12, correctAnswer: '73' },
  { id: 13, correctAnswer: '2' }, { id: 14, correctAnswer: '97' },
  { id: 15, correctAnswer: '42' }, { id: 16, correctAnswer: '35' },
  { id: 17, correctAnswer: '96' }, { id: 18, correctAnswer: '5' },
  { id: 19, correctAnswer: 'nothing' }, { id: 20, correctAnswer: 'nothing' },
  { id: 21, correctAnswer: '26' }, { id: 22, correctAnswer: '45' },
  { id: 23, correctAnswer: 'nothing' }, { id: 24, correctAnswer: 'nothing' },
  { id: 25, correctAnswer: '56' }, { id: 26, correctAnswer: '25' },
  { id: 27, correctAnswer: 'nothing' }, { id: 28, correctAnswer: '6' },
  { id: 29, correctAnswer: 'nothing' }, { id: 30, correctAnswer: '8' },
];

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export class ColorBlindTestService {
  private userAnswers: Map<number, string> = new Map();
  private startTime: number = 0;
  private currentTestPlates: Plate[] = [];

  startTest(): Plate[] {
    this.startTime = Date.now();
    this.userAnswers.clear();
    // Shuffle all plates and pick the first 20 for the test
    this.currentTestPlates = shuffleArray(allPlates).slice(0, 20);
    return this.currentTestPlates;
  }

  submitAnswer(plateId: number, userAnswer: string): void {
    this.userAnswers.set(plateId, userAnswer.trim().toLowerCase());
  }

  calculateResult(): ColorBlindResult {
    const total = this.currentTestPlates.length;
    let correct = 0;
    const missedPlates: { plate: number; correctAnswer: string; userAnswer: string }[] = [];

    this.currentTestPlates.forEach(plate => {
      const userAnswer = this.userAnswers.get(plate.id) || '';
      if (userAnswer === plate.correctAnswer) {
        correct++;
      } else {
        missedPlates.push({ plate: plate.id, correctAnswer: plate.correctAnswer, userAnswer });
      }
    });

    const accuracy = (correct / total) * 100;
    let severity: Severity;
    let type: ColorBlindResult['type'];

    if (correct >= 18) { // >= 90%
        severity = 'NONE';
        type = 'Normal';
    } else if (correct >= 14) { // 70-89%
        severity = 'LOW';
        type = 'Red-Green Deficiency';
    } else if (correct >= 10) { // 50-69%
        severity = 'MEDIUM';
        type = 'Red-Green Deficiency';
    } else { // < 50%
        severity = 'HIGH';
        type = 'Possible Total Color Blindness';
    }

    return {
      correct,
      total,
      accuracy: Math.round(accuracy),
      missedPlates,
      type,
      severity,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}