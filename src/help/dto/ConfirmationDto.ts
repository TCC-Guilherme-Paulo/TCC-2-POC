import { IsMongoId, IsOptional } from "class-validator";

export class ConfirmationDto {
  @IsMongoId()
  readonly helpId: string;

  @IsMongoId()
  @IsOptional()
  readonly helperId?: string;

  @IsMongoId()
  @IsOptional()
  readonly ownerId?: string;
}