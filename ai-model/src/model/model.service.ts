import { Injectable } from '@nestjs/common';
import { TrainingService, TrainingExample } from '../training/training.service';

@Injectable()
export class ModelService {
  constructor(private readonly trainingService: TrainingService) {}

  translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): string {
    const examples = this.trainingService.findFor(sourceLang, targetLang);
    if (!examples || examples.length === 0) {
      // fallback when no training data is available
      return `[${targetLang}] ${text}`;
    }

    const exact = examples.find((e) => e.source === text);
    if (exact) {
      return exact.target;
    }

    // naive: return first example's translation
    return examples[0].target;
  }
}
