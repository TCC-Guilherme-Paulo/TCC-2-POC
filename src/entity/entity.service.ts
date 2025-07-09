import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entity, EntityDocument } from './schemas/entity.schema';
import { EntityRepository } from './entity.repository';

@Injectable()
export class EntityService {
  constructor(
    private readonly entityRepository: EntityRepository,
    @InjectModel(Entity.name) private readonly entityModel: Model<EntityDocument>
  ) {}

  /**
   * Busca entidade (ONG, empresa, grupo) pelo seu ObjectId.
   * Opcionalmente recebe uma projection para limitar os campos retornados.
   */
  async getById(id: string): Promise<Entity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Entidade não encontrada');
    }

    const entity = await this.entityRepository.findById(id);
    if (!entity) {
      throw new NotFoundException('Entidade não encontrada');
    }

    return entity;
  }

  async findOneEntityWithProjection(entityId: string, projection: any): Promise<Entity | null> {
    const query = { _id: new Types.ObjectId(entityId) };
    const entity = await this.entityRepository.findOneEntityWithProjection(
      query,
      projection,
    );

    return entity;
  }
}
