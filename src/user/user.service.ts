import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UsersDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectModel(User.name) private readonly userModel: Model<UsersDocument>,
  ) { }

  async create(data) {
    return await this.userRepository.create(data);
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async getById(id: string, projection?: any): Promise<UsersDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const user = await this.userModel.findById(id, projection).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findOneUserWithProjection(userId: string, projection: any): Promise<User | null> {
    const query = { _id: new Types.ObjectId(userId) };

    const user = await this.userRepository.findOneUserWithProjection(
      query,
      projection,
    );

    return user;
  }
}
