import { IsMongoId, IsString } from 'class-validator';

export class ParamCampaignDto {
  @IsMongoId()
  id: string;
}

export class ParamCampaignWithUserIdDto {
  @IsMongoId()
  userId: string;
} 