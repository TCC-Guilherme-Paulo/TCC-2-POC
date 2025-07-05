import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Categories, CategoriesDocument } from './schemas/categories.schema';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Categories.name) private readonly categoryModel: Model<CategoriesDocument>) {}

  /**
   * Busca categoria pelo _id_.
   * Lança NotFoundException caso não exista.
   * @param id ObjectId da categoria
   */
  async getCategoryById(id: ObjectId): Promise<CategoriesDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }
}
