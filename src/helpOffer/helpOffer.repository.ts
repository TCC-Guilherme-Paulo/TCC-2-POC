import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import { HelpOffer } from './schemas/helpOffer.schema';
import { calculateDistance, getDistance } from 'src/utils/geolocation/calculateDistance';

@Injectable()
export class HelpOfferRepository {
  constructor(
    @InjectModel(HelpOffer.name) private helpOfferModel: Model<HelpOffer>,
  ) {}

  async create(offeredHelp: Partial<HelpOffer>): Promise<HelpOffer> {
    const newOfferedHelp = new this.helpOfferModel(offeredHelp);
    return await newOfferedHelp.save();
  }

  async update(helpOffer: HelpOffer): Promise<void> {
    await this.helpOfferModel.findByIdAndUpdate(helpOffer._id, helpOffer);
  }

  async getByIdWithAggregation(id: string): Promise<HelpOffer | null> {
    const commonUserFields = [
      '_id',
      'name',
      'photo',
      'birthday',
      'phone',
      'address.city',
      'address.state',
    ];

    const helpOfferFields = [
      '_id',
      'description',
      'title',
      'status',
      'ownerId',
      'categoryId',
      'possibleHelpedUsers',
      'possibleEntities',
      'helpedUserId',
      'creationDate',
      'location',
    ];

    return await this.helpOfferModel
      .findById(id)
      .select(helpOfferFields.join(' '))
      .populate('user', commonUserFields.join(' '))
      .populate('categories', '_id name')
      .populate('possibleHelpedUsers', commonUserFields.join(' '))
      .populate('possibleEntities', commonUserFields.join(' '))
      .populate('helpedUsers', commonUserFields.join(' '))
      .exec();
  }

  async list(
    userId: string,
    isUserEntity: boolean,
    categoryArray: string[] | null | undefined,
    getOtherUsers: boolean,
    coords: number[] | null,
  ): Promise<HelpOffer[]> {
    const matchQuery = this.getHelpOfferListQuery(
      userId,
      isUserEntity,
      true,
      getOtherUsers,
      categoryArray,
    );

    const helpOfferFields = [
      '_id',
      'title',
      'categoryId',
      'ownerId',
      'helpedUserId',
      'creationDate',
      'location',
      'description',
      'index',
    ];

    const sort: { [key: string]: SortOrder } = { creationDate: -1 };
    const userFields = ['name', 'address', 'birthday', 'location.coordinates'];

    const helpOffers = await this.helpOfferModel
      .find(matchQuery)
      .select(helpOfferFields.join(' '))
      .populate('user', userFields.join(' '))
      .populate('categories')
      .populate('possibleHelpedUsers', '_id name')
      .populate('possibleEntities', '_id name')
      .sort(sort)
      .exec();

    if (coords) {
      const helpOffersWithDistances = helpOffers.map((offer) => {
        const offerLocation = this.getLocation(offer);
        const offerObj = offer.toObject();
        (offerObj as any).distances = { userCoords: offerLocation, coords };
        
        const userLocation = {
          longitude: coords[0],
          latitude: coords[1],
        };
        
        const coordinates = {
          longitude: offerLocation[0],
          latitude: offerLocation[1],
        };
        
        (offerObj as any).distanceValue = calculateDistance(coordinates, userLocation);
        (offerObj as any).distance = getDistance(coordinates, userLocation);
        return offerObj;
      });

      helpOffersWithDistances.sort((a, b) => (a as any).distanceValue - (b as any).distanceValue);
      return helpOffersWithDistances;
    }

    return helpOffers;
  }

  private getHelpOfferListQuery(
    userId: string,
    isUserEntity: boolean,
    active: boolean,
    getOtherUsers: boolean,
    categoryArray: string[] | null | undefined,
  ): any {
    const matchQuery: any = { active };

    if (!getOtherUsers) {
      matchQuery.ownerId = { $ne: new Types.ObjectId(userId) };

      if (isUserEntity) {
        matchQuery.possibleEntities = { $nin: [new Types.ObjectId(userId)] };
      } else {
        matchQuery.possibleHelpedUsers = { $nin: [new Types.ObjectId(userId)] };
      }
    } else {
      matchQuery.ownerId = { $eq: new Types.ObjectId(userId) };
    }

    if (categoryArray && categoryArray.length > 0) {
      matchQuery.categoryId = {
        $in: categoryArray.map((category) => new Types.ObjectId(category)),
      };
    }

    return matchQuery;
  }

  async listByOwnerId(ownerId: string): Promise<HelpOffer[]> {
    return await this.helpOfferModel.find({ ownerId }).exec();
  }

  async listByHelpedUserId(helpedUserId: string): Promise<HelpOffer[]> {
    return await this.helpOfferModel.find({ helpedUserId }).exec();
  }

  async getById(id: string): Promise<HelpOffer | null> {
    return await this.helpOfferModel.findById(id).exec();
  }

  async findOne(query: any, projection: any, populate: any = null): Promise<HelpOffer | null> {
    let queryBuilder = this.helpOfferModel.findOne(query).select(projection);
    
    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }
    
    return await queryBuilder.exec();
  }

  async finishHelpOfferByOwner(helpOffer: HelpOffer): Promise<void> {
    helpOffer.active = false;
    await this.helpOfferModel.findByIdAndUpdate(helpOffer._id, helpOffer);
  }

  async getEmailByHelpOfferId(helpOfferId: string): Promise<string> {
    const helpOffer = await this.helpOfferModel
      .findById(helpOfferId)
      .select('ownerId')
      .populate('user', 'email -_id')
      .exec();

    return (helpOffer as any)?.user?.email || '';
  }

  private getLocation(offer: HelpOffer): number[] {
    return offer.location?.coordinates || [0, 0];
  }
} 