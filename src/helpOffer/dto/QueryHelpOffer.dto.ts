import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryHelpOfferDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  getOtherUsers?: boolean;

  @IsOptional()
  @IsString()
  coords?: string;

  @IsOptional()
  @IsString()
  categoryArray?: string;
} 