import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryId?: string[];

  @IsMongoId()
  @IsNotEmpty()
  ownerId: string;

  @IsOptional()
  @IsMongoId()
  helperId?: string;

  @IsOptional()
  location?: {
    type: string;
    coordinates: number[];
  };
} 