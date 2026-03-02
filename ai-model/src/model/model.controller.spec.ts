import { Test, TestingModule } from '@nestjs/testing';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { TrainingService } from '../training/training.service';


describe('ModelController', () => {
  let controller: ModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelController],
      providers: [ModelService, { provide: TrainingService, useValue: {} }],
    }).compile();

    controller = module.get<ModelController>(ModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
