import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  findAll() {
    return this.languagesService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    const language = this.languagesService.findOne(name);
    if (!language) {
      throw new NotFoundException('Language not found');
    }
    return language;
  }
}
