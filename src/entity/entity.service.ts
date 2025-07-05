import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entity, EntityDocument } from './schemas/entity.schema';

@Injectable()
export class EntityService {
  constructor(@InjectModel(Entity.name) private readonly entityModel: Model<EntityDocument>) {}

  /**
   * Busca entidade (ONG, empresa, grupo) pelo seu ObjectId.
   * Opcionalmente recebe uma projection para limitar os campos retornados.
   */
  async getById(id: string, projection: string | string[] = ''): Promise<EntityDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Entidade não encontrada');
    }

    const entity = await this.entityModel.findById(id, projection).exec();
    if (!entity) {
      throw new NotFoundException('Entidade não encontrada');
    }

    return entity;
  }
}
