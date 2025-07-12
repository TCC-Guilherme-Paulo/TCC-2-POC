import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ObjectId } from 'mongoose';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Busca uma categoria específica pelo ID
   * @param id ObjectId da categoria
   */
  @Get(':id')
  async getCategoryById(@Param('id') id: ObjectId) {
    return this.categoryService.getCategoryById(id);
  }

  /**
   * Retorna todas as categorias ativas do sistema
   */
  @Get()
  async getCategoryList() {
    return this.categoryService.getCategoryList();
  }
}
