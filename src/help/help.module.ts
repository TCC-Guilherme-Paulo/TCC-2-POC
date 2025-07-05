import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpService } from './help.service';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';
import { Help, HelpSchema } from './schemas/help.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';
import { Categories, CategoriesSchema } from 'src/categories/schemas/categories.schema';
import { Entity, EntitySchema } from 'src/entity/schemas/entity.schema';
import { EntityModule } from 'src/entity/entity.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Help.name, schema: HelpSchema },
      { name: User.name, schema: UserSchema },
      { name: Categories.name, schema: CategoriesSchema },
      { name: Entity.name, schema: EntitySchema },
    ]),
    UserModule,
    EntityModule,
    CategoriesModule,
  ],
  controllers: [HelpController],
  providers: [HelpService, HelpRepository],
  exports: [HelpRepository]
})
export class HelpsModule {}
