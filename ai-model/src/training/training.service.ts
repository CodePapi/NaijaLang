import { Injectable } from '@nestjs/common';

export interface TrainingExample {
  sourceLang: string;
  targetLang: string;
  source: string;
  target: string;
}

@Injectable()
export class TrainingService {
  private examples: TrainingExample[] = [];

  add(example: TrainingExample): TrainingExample {
    this.examples.push(example);
    return example;
  }

  findAll(): TrainingExample[] {
    return this.examples;
  }

  findFor(sourceLang: string, targetLang: string): TrainingExample[] {
    return this.examples.filter(
      (e) =>
        e.sourceLang.toLowerCase() === sourceLang.toLowerCase() &&
        e.targetLang.toLowerCase() === targetLang.toLowerCase(),
    );
  }
}

