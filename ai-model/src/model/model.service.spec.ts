import { Test, TestingModule } from '@nestjs/testing';
import { ModelService } from './model.service';
import { TrainingService } from '../training/training.service';

describe('ModelService', () => {
  let service: ModelService;
  let fakeTraining: Partial<TrainingService>;

  beforeEach(async () => {
    fakeTraining = {
      findFor: jest.fn().mockResolvedValue([
        { source: 'hello', target: 'hola', embedding: [0, 1, 0] },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelService,
        { provide: TrainingService, useValue: fakeTraining },
      ],
    }).compile();

    service = module.get<ModelService>(ModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns exact match', async () => {
    const out = await service.translate('hello', 'en', 'es');
    expect(out).toBe('hola');
  });

  it('falls back to example when no exact match', async () => {
    const out = await service.translate('hell', 'en', 'es');
    expect(out).toBe('hola');
  });
});
