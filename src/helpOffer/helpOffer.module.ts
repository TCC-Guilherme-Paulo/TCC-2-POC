import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpOfferController } from './helpOffer.controller';
import { HelpOfferService } from './helpOffer.service';
import { HelpOfferRepository } from './helpOffer.repository';
import { HelpOffer, HelpOfferSchema } from './schemas/helpOffer.schema';
import { UserModule } from '../user/user.module';
import { EntityModule } from '../entity/entity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HelpOffer.name, schema: HelpOfferSchema },
    ]),
    UserModule,
    EntityModule,
  ],
  controllers: [HelpOfferController],
  providers: [HelpOfferService, HelpOfferRepository],
  exports: [HelpOfferService, HelpOfferRepository],
})
export class HelpOfferModule {} 