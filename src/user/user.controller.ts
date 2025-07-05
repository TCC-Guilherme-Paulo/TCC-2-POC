import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data) {
    return await this.userService.create(data);
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }
}
