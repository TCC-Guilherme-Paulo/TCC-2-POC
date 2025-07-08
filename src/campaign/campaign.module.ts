import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from './campaign.repository';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { CategoryModule } from '../category/category.module';
import { EntityModule } from '../entity/entity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    CategoryModule,
    EntityModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository],
  exports: [CampaignService, CampaignRepository],
})
export class CampaignModule {} 