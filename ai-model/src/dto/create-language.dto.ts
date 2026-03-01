import { IsString, IsOptional } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  name: string;

  @IsString()
  // two-letter unique language code (ISO‑style or custom)
  // validation ensures exactly two characters
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  info?: string;
}
