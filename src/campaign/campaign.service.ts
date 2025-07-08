import { Injectable, BadRequestException } from '@nestjs/common';
import { Types, ObjectId } from 'mongoose';
import { CampaignRepository } from './campaign.repository';
import { Campaign, HelpStatusEnum } from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/CreateCampaign.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class CampaignService {
  constructor(
    private campaignRepository: CampaignRepository,
    private categoryService: CategoryService,
  ) {}

  async createNewCampaign(campaignInfo: CreateCampaignDto): Promise<Campaign> {
    if (campaignInfo.categoryId) {
      // Validate each category ID
      for (const categoryId of campaignInfo.categoryId) {
        await this.categoryService.getCategoryById(categoryId as unknown as ObjectId);
      }
    }
    const campaignData = {
      ...campaignInfo,
      ownerId: new Types.ObjectId(campaignInfo.ownerId),
      categoryId: campaignInfo.categoryId?.map(id => new Types.ObjectId(id)),
      helperId: campaignInfo.helperId ? new Types.ObjectId(campaignInfo.helperId) : undefined,
    };
    const newCampaign = await this.campaignRepository.create(campaignData);
    return newCampaign;
  }

  async listCampaign(): Promise<Campaign[]> {
    const campaign = await this.campaignRepository.list();
    return campaign;
  }

  async getCampaignListByStatus({ userId, statusList }: { userId: string; statusList: string[] }): Promise<Campaign[]> {
    const checkHelpStatusExistence = statusList.filter(
      (item) => !Object.values(HelpStatusEnum).includes(item as HelpStatusEnum),
    );

    if (checkHelpStatusExistence.length > 0) {
      throw new BadRequestException('Um dos status informados é inválido');
    }

    const helpList = await this.campaignRepository.getCampaignListByStatus(
      userId,
      statusList,
    );

    return helpList;
  }

  async getNearCampaignList(
    coords: number[],
    except: boolean,
    id: string | null,
    categoryArray: string[] | null,
  ): Promise<Campaign[]> {
    const campaignList = await this.campaignRepository.listNear(
      coords,
      except,
      id,
      categoryArray,
    );
    
    if (!campaignList) {
      throw new BadRequestException(
        'Nenhuma campanha foi encontrada no seu raio de distância',
      );
    }

    return campaignList;
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.getById(id);

    if (!campaign) {
      throw new BadRequestException('Campanha não encontrada');
    }

    return campaign;
  }

  async deleteCampaign(id: string): Promise<{ message: string }> {
    let campaign = await this.getCampaignById(id);
    console.log(campaign);
    campaign.active = false;

    await this.campaignRepository.update(campaign);

    campaign = JSON.parse(JSON.stringify(campaign));
    return { message: `Campaign ${id} deleted!` };
  }

  async listCampaignByOwnerId(ownerId: string): Promise<Campaign[]> {
    const campaign = await this.campaignRepository.listByOwnerId(ownerId);
    return campaign;
  }

  async finishCampaign(id: string): Promise<void> {
    const campaign = await this.getCampaignById(id);

    campaign.status = HelpStatusEnum.FINISHED;

    await this.campaignRepository.update(campaign);
  }
} 