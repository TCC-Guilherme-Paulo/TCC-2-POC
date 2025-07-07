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

  async findOneUserWithProjection(query: any, projection: any): Promise<User | null> {
    const user = await this.model.findOne(query, projection).exec();
    return user;
  }
}
