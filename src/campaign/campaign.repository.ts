import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './schemas/campaign.schema';
import { calculateDistance, getDistance } from 'src/utils/geolocation/calculateDistance';
import { EntityService } from '../entity/entity.service';

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    private entityService: EntityService,
  ) {}

  async create(campaign: Partial<Campaign>): Promise<Campaign> {
    const newCampaign = new this.campaignModel(campaign);
    return await newCampaign.save();
  }

  async list(): Promise<Campaign[]> {
    return await this.campaignModel
      .find()
      .populate('campaign')
      .exec();
  }

  async listByOwnerId(ownerId: string): Promise<Campaign[]> {
    const query = { ownerId };
    const populate = ['entity', 'categories'];
    
    return await this.campaignModel
      .find(query)
      .populate(populate)
      .exec();
  }

  async getById(id: string): Promise<Campaign | null> {
    const populate = ['entity', 'categories'];
    
    return await this.campaignModel
      .findById(id)
      .populate(populate)
      .exec();
  }

  async update(campaign: Campaign): Promise<void> {
    await this.campaignModel.findByIdAndUpdate(campaign._id, campaign);
  }

  async listNear(
    coords: number[],
    except: boolean,
    id: string | null,
    categoryArray: string[] | null,
  ): Promise<Campaign[]> {
    const userQuery: any = {};
    if (except && id) {
      userQuery._id = { $ne: new Types.ObjectId(id) };
    }

    // Buscar entidades ativas
    const entities = await this.entityService.findActiveEntities(userQuery);
    const arrayUsersId = entities.map((entity) => (entity as any)._id);

    const matchQuery: any = {
      active: true,
      ownerId: { $in: arrayUsersId },
      status: 'waiting',
    };

    const populate = ['entity', 'categories'];

    if (categoryArray) {
      matchQuery.categoryId = {
        $in: categoryArray.map((categoryString) => new Types.ObjectId(categoryString)),
      };
    }

    const campaigns = await this.campaignModel
      .find(matchQuery)
      .populate(populate)
      .exec();

    const campaignsWithDistances = campaigns.map((campaign) => {
      const campaignLocation = this.getLocation(campaign);
      const campaignObj = campaign.toObject();
      
      // Calcular distâncias diretamente
      const userLocation = {
        longitude: coords[0],
        latitude: coords[1],
      };
      const coordinates = {
        longitude: campaignLocation[0],
        latitude: campaignLocation[1],
      };
      
      (campaignObj as any).distances = { campaignCoords: campaignLocation, coords };
      (campaignObj as any).distanceValue = calculateDistance(coordinates, userLocation);
      (campaignObj as any).distance = getDistance(coordinates, userLocation);
      
      return campaignObj;
    });

    campaignsWithDistances.sort((a, b) => (a as any).distanceValue - (b as any).distanceValue);

    return campaignsWithDistances;
  }

  async getCampaignListByStatus(userId: string, statusList: string[]): Promise<Campaign[]> {
    const matchQuery = {
      ownerId: new Types.ObjectId(userId),
      status: {
        $in: [...statusList],
      },
      active: true,
    };

    const entity = 'entity';
    const categories = 'categories';

    return await this.campaignModel
      .find(matchQuery)
      .populate([entity, categories])
      .exec();
  }

  private getLocation(campaign: Campaign): number[] {
    return campaign.location?.coordinates || [0, 0];
  }
} 