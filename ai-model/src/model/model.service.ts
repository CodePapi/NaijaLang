import { Injectable } from '@nestjs/common';
import { TrainingService } from '../training/training.service';

// simple Levenshtein distance helper for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
      }
    }
  }
  return matrix[b.length][a.length];
}

@Injectable()
export class ModelService {
  constructor(private readonly trainingService: TrainingService) {}

  async translate(
    text: string,
    sourceLang:string,
    targetLang:string,
  ): Promise<string> {
    const examples = await this.trainingService.findFor(sourceLang, targetLang);
    if (!examples || examples.length === 0) {
      // fallback when no training data is available
      return `[${targetLang}] ${text}`;
    }

    // exact match
    const exact = examples.find((e) => e.source === text);
    if (exact) {
      return exact.target;
    }

    // fuzzy match by Levenshtein distance
    let best: { example: any; score: number } | null = null;
    for (const e of examples) {
      const score = levenshtein(text.toLowerCase(), e.source.toLowerCase());
      if (!best || score < best.score) {
        best = { example: e, score };
      }
    }
    if (best) {
      return best.example.target;
    }

    // naive fallback
    return examples[0].target;
  }
}
