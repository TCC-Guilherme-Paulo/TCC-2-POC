import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategoriesSchema } from './schemas/categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoriesModule {}
