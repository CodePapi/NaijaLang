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

import { embed as textEmbed, distance as vectorDistance } from '../utils/embedding';
import { translateWithOpenAI } from '../utils/openai';

// simple heuristic to detect when the model returned a dummy translation
function isPlaceholder(translation: string, original: string, targetLang: string): boolean {
  if (!translation) return false;
  const normalized = translation.toLowerCase().trim();
  const orig = original.toLowerCase().trim();
  if (normalized === orig) return true; // unchanged
  if (normalized.includes(`in ${targetLang.toLowerCase()}`)) return true;
  if (normalized.startsWith('[') && normalized.endsWith(']')) return true;
  return false;
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

    // try to leverage a cloud LLM if configured
    const aiResult = await translateWithOpenAI(text, sourceLang, targetLang, examples);
    if (aiResult) {
      // if the model just returned a placeholder phrase, encourage training
      if (isPlaceholder(aiResult, text, targetLang)) {
        return `Sorry, I don't have a proper ${targetLang} translation yet. Please visit the training page and add examples – the model will improve as people teach it.`;
      }
      return aiResult;
    }

    // exact match
    const exact = examples.find((e) => e.source === text);
    if (exact) {
      return exact.target;
    }

    // if examples have embeddings, perform vector search
    const inputEmb = await textEmbed(text);
    let bestVec: { example: any; dist: number } | null = null;
    for (const e of examples) {
      if (e.embedding && Array.isArray(e.embedding)) {
        const dist = vectorDistance(inputEmb, e.embedding);
        if (!bestVec || dist < bestVec.dist) {
          bestVec = { example: e, dist };
        }
      }
    }
    if (bestVec) {
      return bestVec.example.target;
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
