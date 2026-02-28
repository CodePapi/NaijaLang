import { IsString } from 'class-validator';

export class TranslateDto {
  @IsString()
  text: string;

  @IsString()
  sourceLang: string;

  @IsString()
  targetLang: string;
}
