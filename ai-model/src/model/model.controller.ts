import { Controller, Post, Body } from '@nestjs/common';
import { ModelService } from './model.service';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post('translate')
  translate(
    @Body()
    body: { text: string; sourceLang: string; targetLang: string },
  ) {
    const { text, sourceLang, targetLang } = body;
    return { translation: this.modelService.translate(text, sourceLang, targetLang) };
  }
}
