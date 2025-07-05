import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpService } from './help.service';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';
import { Help, HelpSchema } from './schemas/help.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';
import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { Entity, EntitySchema } from 'src/entity/schemas/entity.schema';
import { EntityModule } from 'src/entity/entity.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Help.name, schema: HelpSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Entity.name, schema: EntitySchema },
    ]),
    UserModule,
    EntityModule,
    CategoryModule,
  ],
  controllers: [HelpController],
  providers: [HelpService, HelpRepository],
  exports: [HelpRepository]
})
export class HelpModule {}
