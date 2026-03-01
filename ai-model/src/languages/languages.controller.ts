import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all languages' })
  async findAll() {
    return this.languagesService.findAll();
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get information about a language by name or code' })
  async findOne(@Param('identifier') identifier: string) {
    const language = await this.languagesService.findOne(identifier);
    if (!language) {
      throw new NotFoundException('Language not found');
    }
    return language;
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed languages from root lang.json file' })
  async seed() {
    return this.languagesService.seedFromFile();
  }
}
