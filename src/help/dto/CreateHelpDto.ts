import { IsArray, IsMongoId, IsOptional, IsString, ArrayNotEmpty, IsObject } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateHelpDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  /** Uma ajuda pode pertencer a uma ou mais categorias. */
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  readonly categoryId: ObjectId;

  /** Identificador do solicitante (usuário). */
  @IsMongoId()
  readonly ownerId: ObjectId;

  /** Coordenadas `[longitude, latitude]` ‑ opcional. */
  @IsObject()
  @IsOptional()
  readonly location: {
    type: 'Point';
    coordinates: [number, number];
  };
}