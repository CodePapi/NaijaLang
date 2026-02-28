import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LanguagesModule } from './languages/languages.module';
import { TrainingModule } from './training/training.module';
import { ModelModule } from './model/model.module';

@Module({
  imports: [LanguagesModule, TrainingModule, ModelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
