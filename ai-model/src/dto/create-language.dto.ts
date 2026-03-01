import { IsString, IsOptional } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  info?: string;
}
