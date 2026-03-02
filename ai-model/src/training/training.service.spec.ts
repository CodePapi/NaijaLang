import { Test, TestingModule } from '@nestjs/testing';
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
    expect(fakePrisma.trainingExample.create).toHaveBeenCalled();
    const calledWith = (fakePrisma.trainingExample.create as jest.Mock).mock
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
    expect(fakePrisma.trainingExample.createMany).toHaveBeenCalled();
    const arg = (fakePrisma.trainingExample.createMany as jest.Mock).mock
      .calls[0][0].data;
    expect(Array.isArray(arg)).toBe(true);
    expect(arg.length).toBe(2);
  });
});
