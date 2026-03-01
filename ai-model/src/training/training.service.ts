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
    const e = { ...example, embedding: textEmbed(example.source) };
    return this.prisma.trainingExample.create({ data: e });
  }

  async addBatch(examples: TrainingExample[]) {
    const withEmb = examples.map((ex) => ({
      ...ex,
      embedding: textEmbed(ex.source),
    }));
    return this.prisma.trainingExample.createMany({ data: withEmb });
  }

  async findAll() {
    return this.prisma.trainingExample.findMany();
  }

  async findFor(sourceLang: string, targetLang: string) {
    return this.prisma.trainingExample.findMany({
      where: {
        sourceLang: { equals: sourceLang, mode: 'insensitive' },
        targetLang: { equals: targetLang, mode: 'insensitive' },
      },
    });
  }
}

