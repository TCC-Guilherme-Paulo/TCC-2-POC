import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId, MaxLength } from 'class-validator';

export class CreateHelpOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  description: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryId?: string[];

  @IsMongoId()
  @IsNotEmpty()
  ownerId: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  possibleHelpedUsers?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  possibleEntities?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  helpedUserId?: string[];

  @IsOptional()
  location?: {
    type: string;
    coordinates: number[];
  };
} 