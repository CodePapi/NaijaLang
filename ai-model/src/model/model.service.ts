import { Injectable, BadRequestException } from '@nestjs/common';
import { TrainingService } from '../training/training.service';
import { normalizeLang } from '../utils/languages';

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
export function isPlaceholder(translation: string, original: string, targetLang: string): boolean {
  if (!translation) return false;
  const normalized = translation.toLowerCase().trim();
  const orig = original.toLowerCase().trim();
  if (normalized === orig) return true; // unchanged
  if (normalized.includes(`in ${targetLang.toLowerCase()}`)) return true;
  if (normalized.startsWith('[') && normalized.endsWith(']')) return true;
  // if translation contains no Latin letters at all (likely nonsense)
  const latin = /[a-zA-Z]/;
  if (!latin.test(translation)) return true;
  // if the output contains characters outside the basic ASCII Latin set
  // (letters, digits and common punctuation) it's probably gibberish – the
  // model often invents accented words when it doesn't understand a code.
  const allowed = /^[a-zA-Z0-9\s\.,!\?'"\-]+$/;
  if (!allowed.test(translation)) return true;
  return false;
}

@Injectable()
export class ModelService {
  constructor(private readonly trainingService: TrainingService) {}

  /**
   * trigger a fine-tune run using accumulated training examples
   * returns a short status message; the actual fine-tune job is executed
   * only if an OPENAI_API_KEY is configured. This is a synchronous helper;
   * in production you would likely call this from a cron job or queue.
   */
  async fineTune(): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return 'no API key configured for fine-tuning';
    }

    // gather examples from database
    const examples = await this.trainingService.findAll();
    if (!examples || examples.length === 0) {
      return 'no training examples available';
    }

    // prepare jsonl payload for OpenAI
    const jsonlLines = examples.map((e) => {
      return JSON.stringify({
        prompt: `${e.source}\n`,
        completion: ` ${e.target}`,
      });
    });
    const content = jsonlLines.join('\n');

    // save to temporary file
    const fs = await import('fs');
    const tmpFile = `/tmp/training_${Date.now()}.jsonl`;
    fs.writeFileSync(tmpFile, content);

    // run fine-tune via OpenAI
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      // the TypeScript defs bundled with openai@4.4.0 don't yet include
      // the fineTunes property even though the runtime supports it, so cast
      // to any to keep the compiler happy.
      const resp = await (client as any).fineTunes.create({
        training_file: tmpFile,
      });
      return `fine-tune started: ${resp.id}`;
    } catch (err) {
      console.error('fine-tune error', err);
      return 'fine-tune request failed';
    }
  }

  async translate(
    text: string,
    sourceLang:string,
    targetLang:string,
  ): Promise<string> {
    const src = normalizeLang(sourceLang);
    const tgt = normalizeLang(targetLang);

    const examples = await this.trainingService.findFor(src.code, tgt.code);
    if (!examples || examples.length === 0) {
      // fallback when no training data is available
      return `[${tgt.code}] ${text}`;
    }

    // try to leverage a cloud LLM if configured; use the friendly names in the
    // prompt so the model understands languages like "Nigerian Pidgin" (code
    // "np") instead of seeing terse codes.
    const aiResult = await translateWithOpenAI(text, src.name, tgt.name, examples);
    if (aiResult) {
      // if the model just returned a placeholder phrase, encourage training
      if (isPlaceholder(aiResult, text, tgt.code)) {
        // throw an HTTP exception so the controller can return a 400 and the
        // frontend can display a helpful message instead of a bogus result
        throw new BadRequestException(
          `Sorry, I don't have a proper ${tgt.name} translation yet. Please visit the training page and add examples – the model will improve as people teach it.`,
        );
      }
      return aiResult;
    }

    // exact match
    const exact = examples.find((e) => e.source === text);
    if (exact) {
      if (isPlaceholder(exact.target, text, tgt.code)) {
        throw new BadRequestException(
          `Sorry, I don't have a proper ${tgt.name} translation yet. Please visit the training page and add examples – the model will improve as people teach it.`,
        );
      }
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
      if (isPlaceholder(bestVec.example.target, text, tgt.code)) {
        throw new BadRequestException(
          `Sorry, I don't have a proper ${tgt.name} translation yet. Please visit the training page and add examples – the model will improve as people teach it.`,
        );
      }
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
      if (isPlaceholder(best.example.target, text, tgt.code)) {
        throw new BadRequestException(
          `Sorry, I don't have a proper ${tgt.name} translation yet. Please visit the training page and add examples – the model will improve as people teach it.`,
        );
      }
      return best.example.target;
    }

    // naive fallback
    const naive = examples[0].target;
    if (isPlaceholder(naive, text, tgt.code)) {
      throw new BadRequestException(
        `Sorry, I don't have a proper ${tgt.name} translation yet. Please visit the training page and add examples – the model will improve as people teach it.`,
      );
    }
    return naive;
  }
}
