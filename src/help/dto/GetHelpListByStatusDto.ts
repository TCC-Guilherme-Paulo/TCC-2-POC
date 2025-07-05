import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { HelpStatus } from '../enums/HelpStatus.enum';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty } from 'class-validator';

export class GetHelpListByStatusDto {
  @IsMongoId()
  readonly userId: string;

  /** Recebe lista de status via query (?statusList=a,b).  */
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(HelpStatus, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  readonly statusList: HelpStatus[];

  @IsBoolean()
  @IsOptional()
  readonly helper?: boolean;
}
