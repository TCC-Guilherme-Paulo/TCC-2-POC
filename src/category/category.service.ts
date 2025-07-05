import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>) {}

  /**
   * Busca categoria pelo _id_.
   * Lança NotFoundException caso não exista.
   * @param id ObjectId da categoria
   */
  async getCategoryById(id: ObjectId): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }
}
