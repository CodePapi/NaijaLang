import { IsString } from 'class-validator';

export class CreateTrainingDto {
  @IsString()
  sourceLang: string;

  @IsString()
  targetLang: string;

  @IsString()
  source: string;

  @IsString()
  target: string;
}
