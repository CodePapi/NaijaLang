import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { embed as textEmbed } from '../utils/embedding';

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
    if (!process.env.DATABASE_URL) {
      // can't persist without a database; just compute embedding and return
      const emb = await textEmbed(example.source);
      return { ...example, embedding: emb };
    }
    const emb = await textEmbed(example.source);
    const e = { ...example, embedding: emb };
    try {
      return this.prisma.trainingExample.create({ data: e });
    } catch (err) {
      console.warn('training.add db error, ignoring', err?.message);
      return e;
    }
  }

  async addBatch(examples: TrainingExample[]) {
    if (!process.env.DATABASE_URL) {
      const withEmb = [] as Array<TrainingExample & { embedding: number[] }>;
      for (const ex of examples) {
        const emb = await textEmbed(ex.source);
        withEmb.push({ ...ex, embedding: emb });
      }
      return { count: withEmb.length };
    }
    const withEmb = [] as Array<TrainingExample & { embedding: number[] }>;
    for (const ex of examples) {
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
    try {
      return this.prisma.trainingExample.findMany({
        where: {
          sourceLang: { equals: sourceLang, mode: 'insensitive' },
          targetLang: { equals: targetLang, mode: 'insensitive' },
        },
      });
    } catch {
      return [];
    }
  }
}

