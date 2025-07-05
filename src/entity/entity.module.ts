import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EntityService } from './entity.service';
import { Entity, EntitySchema } from './schemas/entity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Entity.name, schema: EntitySchema },
    ]),
  ],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {} 