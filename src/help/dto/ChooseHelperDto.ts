import { IsMongoId } from 'class-validator';

export class ChooseHelperDto {
  @IsMongoId()
  readonly idHelp: string;

  @IsMongoId()
  readonly idHelper: string;
}