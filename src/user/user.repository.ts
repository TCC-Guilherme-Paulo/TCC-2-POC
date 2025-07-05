import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  async create(data) {
    return new this.model(data).save();
  }

  async findAll() {
    return this.model.find().exec();
  }
}
