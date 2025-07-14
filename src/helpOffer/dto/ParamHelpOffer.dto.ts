import { IsMongoId } from 'class-validator';

export class ParamHelpOfferDto {
  @IsMongoId()
  id: string;
}

export class ParamHelpOfferWithHelpedIdDto {
  @IsMongoId()
  helpedId: string;

  @IsMongoId()
  helpOfferId: string;
}

export class ParamHelpOfferWithHelpedUserIdDto {
  @IsMongoId()
  helpedUserId: string;
} 