import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import type { TrainingExample } from './training.service';
import { CreateTrainingDto } from '../dto/create-training.dto';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  // accept array of examples to insert in one call
  @Post('batch')
  async addBatch(@Body() examples: CreateTrainingDto[]) {
    return this.trainingService.addBatch(examples);
  }

  @Post()
  async addExample(@Body() example: CreateTrainingDto) {
    return this.trainingService.add(example);
  }

  @Get()
  async findAll() {
    return this.trainingService.findAll();
  }

  @Get(':source/:target')
  async findFor(
    @Param('source') source: string,
    @Param('target') target: string,
  ) {
    return this.trainingService.findFor(source, target);
  }
}
