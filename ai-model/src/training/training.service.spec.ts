/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

// allow longer time in case embedding calls hit external API
jest.setTimeout(30000);
// mock embedding so tests run offline and quickly
jest.mock('../utils/embedding', () => ({
  embed: (text: string) => new Array(128).fill(0),
  distance: (a: number[], b: number[]) => 0,
}));
import { TrainingService, TrainingExample } from './training.service';
import { PrismaService } from '../prisma/prisma.service';

// simple helper from the actual util so we can compute expected emb
import { embed as localEmbed } from '../utils/embedding';

describe('TrainingService', () => {
  let service: TrainingService;
  let fakePrisma: Partial<PrismaService>;

  beforeEach(async () => {
    fakePrisma = {
      trainingExample: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls prisma.create with computed embedding', async () => {
    const example: TrainingExample = {
      sourceLang: 'en',
      targetLang: 'es',
      source: 'hello world',
      target: 'hola mundo',
    };
    await service.add(example);
    expect(fakePrisma.trainingExample!.create).toHaveBeenCalled();
    const calledWith = (fakePrisma.trainingExample!.create as jest.Mock).mock
      .calls[0][0].data;
    expect(calledWith.source).toEqual(example.source);
    expect(Array.isArray(calledWith.embedding)).toBe(true);
    // confirm embedding matches local algorithm when no API key
    const expected = await localEmbed(example.source);
    expect(calledWith.embedding).toEqual(expected);
  });

  it('addBatch processes each element', async () => {
    const examples: TrainingExample[] = [
      { sourceLang: 'a', targetLang: 'b', source: 'x', target: 'y' },
      { sourceLang: 'a', targetLang: 'b', source: 'foo', target: 'bar' },
    ];
    await service.addBatch(examples);
    expect(fakePrisma.trainingExample!.createMany).toHaveBeenCalled();
    const arg = (fakePrisma.trainingExample!.createMany as jest.Mock).mock
      .calls[0][0].data;
    expect(Array.isArray(arg)).toBe(true);
    expect(arg.length).toBe(2);
  });

  it('normalizes language identifiers before storing', async () => {
    const example: TrainingExample = {
      sourceLang: 'Nigerian Pidgin',
      targetLang: 'Spanish',
      source: 'hello',
      target: 'hola',
    };
    await service.add(example);
    expect(fakePrisma.trainingExample!.create).toHaveBeenCalled();
    const calledWith = (fakePrisma.trainingExample!.create as jest.Mock).mock
      .calls[0][0].data;
    expect(calledWith.sourceLang).toBe('np');
    expect(calledWith.targetLang.toLowerCase()).toBe('spanish');
  });

  it('understands numeric-style codes like m4 (Mandara)', async () => {
    const example: TrainingExample = {
      sourceLang: 'm4',
      targetLang: 'en',
      source: 'foo',
      target: 'bar',
    };
    await service.add(example);
    const calledWith = (fakePrisma.trainingExample!.create as jest.Mock).mock
      .calls[0][0].data;
    expect(calledWith.sourceLang).toBe('m4');
  });
});
