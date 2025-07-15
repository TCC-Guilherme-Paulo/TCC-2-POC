import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryRepository {
  constructor(@InjectModel(Category.name) private readonly model: Model<CategoryDocument>) {}

  async findAll(): Promise<CategoryDocument[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return this.model.findById(id).exec();
  }
} 