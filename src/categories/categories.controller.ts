import { Controller } from '@nestjs/common';
import { CategoryService } from './categories.service';

@Controller('category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoryService) {}
}
