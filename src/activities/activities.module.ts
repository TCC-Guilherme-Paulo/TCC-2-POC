import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { HelpModule } from 'src/help/help.module';
import { HelpOfferRepository } from '../helpOffer/helpOffer.repository';
import { CampaignRepository } from '../campaign/campaign.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpOffer, HelpOfferSchema } from '../helpOffer/schemas/helpOffer.schema';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';
import { EntityService } from '../entity/entity.service';
import { EntityRepository } from '../entity/entity.repository';
import { Entity, EntitySchema } from '../entity/schemas/entity.schema';

@Module({
  imports: [
    HelpModule,
    MongooseModule.forFeature([
      { name: HelpOffer.name, schema: HelpOfferSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Entity.name, schema: EntitySchema },
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, HelpOfferRepository, CampaignRepository, EntityService, EntityRepository],
})
export class ActivitiesModule {}
