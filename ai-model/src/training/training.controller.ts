import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import type { TrainingExample } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  addExample(@Body() example: TrainingExample) {
    return this.trainingService.add(example);
  }

  @Get()
  findAll() {
    return this.trainingService.findAll();
  }

  @Get(':source/:target')
  findFor(
    @Param('source') source: string,
    @Param('target') target: string,
  ) {
    return this.trainingService.findFor(source, target);
  }
}
