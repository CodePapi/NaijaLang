import { Controller, Post, Body } from '@nestjs/common';
import { ModelService } from './model.service';
import { TranslateDto } from '../dto/translate.dto';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post('translate')
  async translate(@Body() body: TranslateDto) {
    const { text, sourceLang, targetLang } = body;
    const translation = await this.modelService.translate(text, sourceLang, targetLang);
    return { translation };
  }
}
