import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TrainingExample {
  sourceLang: string;
  targetLang: string;
  source: string;
  target: string;
}

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async add(example: TrainingExample) {
    return this.prisma.trainingExample.create({ data: example });
  }

  async addBatch(examples: TrainingExample[]) {
    return this.prisma.trainingExample.createMany({ data: examples });
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

