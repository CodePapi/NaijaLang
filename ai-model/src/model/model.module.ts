import { Module } from '@nestjs/common';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [TrainingModule],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
