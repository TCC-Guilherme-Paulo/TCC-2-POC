import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entity } from './schemas/entity.schema';

@Injectable()
export class EntityRepository {
  constructor(@InjectModel(Entity.name) private readonly model: Model<Entity>) {}

  async findOneEntityWithProjection(query: any, projection: any): Promise<Entity | null> {
    const entity = await this.model.findOne(query, projection).exec();
    return entity;
  }

  async findById(id: string): Promise<Entity | null> {
    return this.model.findById(id).exec();
  }

  async findActiveEntities(query: any = {}): Promise<Entity[]> {
    return this.model.find({ ...query, active: true }).exec();
  }
}