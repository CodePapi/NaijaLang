import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { embed as textEmbed } from '../utils/embedding';
import { normalizeLang } from '../utils/languages';

export interface TrainingExample {
  sourceLang: string;
  targetLang: string;
  source: string;
  target: string;
  embedding?: number[];
}

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async add(example: TrainingExample) {
    // normalize language identifiers to codes so the database is consistent
    const src = normalizeLang(example.sourceLang);
    const tgt = normalizeLang(example.targetLang);
    const normalized: TrainingExample = {
      ...example,
      sourceLang: src.code,
      targetLang: tgt.code,
    };

    if (!process.env.DATABASE_URL) {
      // can't persist without a database; just compute embedding and return
      const emb = await textEmbed(normalized.source);
      return { ...normalized, embedding: emb };
    }
    const emb = await textEmbed(normalized.source);
    const e = { ...normalized, embedding: emb };
    try {
      return this.prisma.trainingExample.create({ data: e });
    } catch (err) {
      console.warn('training.add db error, ignoring', err?.message);
      return e;
    }
  }

  async addBatch(examples: TrainingExample[]) {
    // normalize every language code before computing embeddings
    const normalizedExamples: TrainingExample[] = examples.map((ex) => {
      const src = normalizeLang(ex.sourceLang);
      const tgt = normalizeLang(ex.targetLang);
      return { ...ex, sourceLang: src.code, targetLang: tgt.code };
    });

    if (!process.env.DATABASE_URL) {
      const withEmb = [] as Array<TrainingExample & { embedding: number[] }>;
      for (const ex of normalizedExamples) {
        const emb = await textEmbed(ex.source);
        withEmb.push({ ...ex, embedding: emb });
      }
      return { count: withEmb.length };
    }
    const withEmb = [] as Array<TrainingExample & { embedding: number[] }>;
    for (const ex of normalizedExamples) {
      const emb = await textEmbed(ex.source);
      withEmb.push({ ...ex, embedding: emb });
    }
    try {
      return this.prisma.trainingExample.createMany({ data: withEmb });
    } catch (err) {
      console.warn('training.addBatch db error, ignoring', err?.message);
      return { count: withEmb.length };
    }
  }

  async findAll() {
    if (!process.env.DATABASE_URL) return [];
    try {
      return this.prisma.trainingExample.findMany();
    } catch {
      return [];
    }
  }

  async findFor(sourceLang: string, targetLang: string) {
    if (!process.env.DATABASE_URL) return [];
    // normalize input before querying
    const src = normalizeLang(sourceLang);
    const tgt = normalizeLang(targetLang);
    try {
      return this.prisma.trainingExample.findMany({
        where: {
          sourceLang: { equals: src.code, mode: 'insensitive' },
          targetLang: { equals: tgt.code, mode: 'insensitive' },
        },
      });
    } catch {
      return [];
    }
  }
}
