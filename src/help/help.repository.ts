import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types, UpdateQuery } from 'mongoose';
import { Help, HelpDocument } from './schemas/help.schema';
import { CreateHelpDto } from './dto/CreateHelpDto';
import { HelpStatus } from './enums/HelpStatus.enum';

@Injectable()
export class HelpRepository {
  constructor(@InjectModel(Help.name) private readonly helpModel: Model<HelpDocument>) { }

  async countByOwner(ownerId: ObjectId): Promise<number> {
    const query: FilterQuery<HelpDocument> = {
      ownerId,
      active: true,
      status: { $ne: HelpStatus.FINISHED },
    };
    return this.helpModel.countDocuments(query);
  }

  /** Cria e retorna a nova ajuda. */
  async create(dto: CreateHelpDto): Promise<any> {
    // Busca o maior index atual
    const lastHelp = await this.helpModel.findOne().sort({ index: -1 }).exec();
    const nextIndex = lastHelp ? lastHelp.index + 1 : 0;
    const help = await this.helpModel.create({ ...dto, index: nextIndex });
    const result = await this.helpModel.findById(help._id)
      .populate([
        { path: 'user', select: ['name', 'riskGroup'] },
        { path: 'categories', select: ['name'] },
      ])
      .exec();
    if (!result) throw new NotFoundException('Help not found after creation');
    return {
      _id: result._id,
      ownerId: result.ownerId,
      title: result.title,
      categoryId: result.categoryId,
      categories: (result as any).categories,
      user: (result as any).user,
      location: result.location,
    };
  }

  /** Retorna ajuda simples pelo _id_. */
  async getById(id: string): Promise<HelpDocument | null> {
    return this.helpModel.findById(id).exec();
  }

  /** Atualiza e retorna o documento (com `new:true`). */
  async update(help: HelpDocument | UpdateQuery<HelpDocument>): Promise<void> {
    await this.helpModel.findByIdAndUpdate(help._id, help, { new: true }).exec();
  }

  async getByIdWithAggregation(id: string): Promise<any> {
    const matchQuery = { _id: new Types.ObjectId(id) };
    const helpFields = [
      '_id', 'ownerId', 'categoryId', 'possibleHelpers', 'possibleEntities',
      'description', 'helperId', 'status', 'title', 'location', 'creationDate',
    ];
    return await this.helpModel.findOne(matchQuery, helpFields.join(' '))
      .populate([
        { path: 'user', select: ['photo', 'name', 'phone', 'birthday', 'address.city', 'location.coordinates'] },
        { path: 'categories', select: ['_id', 'name'] },
        { path: 'possibleHelpers', select: ['_id', 'name', 'phone', 'photo', 'birthday', 'address.city', 'address.state'] },
        { path: 'possibleEntities', select: ['_id', 'name', 'photo', 'address.city', 'address.state'] },
      ])
      .exec();
  }

  async shortList(
    coords: number[],
    id: string,
    isUserEntity: boolean,
    categoryArray?: string[],
  ): Promise<any[]> {
    const matchQuery: FilterQuery<HelpDocument> = {
      active: true,
      ownerId: { $ne: new Types.ObjectId(id) },
      status: HelpStatus.WAITING,
    };
    if (isUserEntity) {
      matchQuery.possibleEntities = { $nin: [new Types.ObjectId(id)] };
    } else {
      matchQuery.possibleHelpers = { $nin: [new Types.ObjectId(id)] };
    }
    if (categoryArray && categoryArray.length > 0) {
      matchQuery.categoryId = {
        $in: categoryArray.map((categoryString) => new Types.ObjectId(categoryString)),
      };
    }
    const helpFields = '_id title description categoryId ownerId creationDate location index';
    const helps = await this.helpModel.find(matchQuery, helpFields)
      .populate([
        { path: 'user', select: ['name', 'riskGroup', 'location.coordinates'] },
        { path: 'categories', select: ['_id', 'name'] },
      ])
      .exec();

    const helpsWithDistance = helps.map((help: any) => {
      const helpLocation = help.location?.coordinates;
      help.distances = { userCoords: helpLocation, coords };
      return help.toObject();
    });

    return helpsWithDistance;
  }

  async getHelpListByStatus(userId: string, statusList: HelpStatus[], helper: boolean): Promise<any[]> {
    const matchQuery: any = {
      status: { $in: [...statusList] },
      active: true,
    };
    const fields = '_id description title status ownerId categoryId creationDate';
    const user = { path: 'user', select: ['photo', 'phone', 'name', 'birthday', 'address.city', 'location.coordinates'] };
    const categories = { path: 'categories', select: ['_id', 'name'] };
    const populate = [user, categories];
    if (helper) {
      user.select.push('location.coordinates');
      matchQuery.$or = [
        { possibleHelpers: { $in: [new Types.ObjectId(userId)] } },
        { helperId: new Types.ObjectId(userId) },
      ];
    } else {
      const possibleHelpers = { path: 'possibleHelpers', select: ['_id', 'photo', 'name', 'birthday', 'address.city'] };
      const possibleEntities = { path: 'possibleEntities', select: ['_id', 'photo', 'name', 'birthday', 'address.city'] };
      populate.push(possibleHelpers, possibleEntities);
      matchQuery.ownerId = new Types.ObjectId(userId);
    }
    return this.helpModel.find(matchQuery, fields).populate(populate).exec();
  }

  async listToExpire(): Promise<HelpDocument[]> {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    return this.helpModel.find({
      creationDate: { $lt: date },
      active: true,
    }).exec();
  }

  async getHelpInfoById(helpId: string): Promise<any> {
    const matchQuery = { _id: new Types.ObjectId(helpId) };
    const populate = { path: 'user', select: ['photo', 'birthday', 'address.city'] };
    const projection = { "_id": 1, "description": 1 };
    return await this.helpModel.findOne(matchQuery).populate([populate]).exec();
  }
}
