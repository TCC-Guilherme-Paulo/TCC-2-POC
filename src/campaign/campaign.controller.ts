import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/CreateCampaign.dto';
import { QueryCampaignDto } from './dto/QueryCampaign.dto';
import { ParamCampaignDto, ParamCampaignWithUserIdDto } from './dto/ParamCampaign.dto';

// Guard mock - seria implementado com Firebase Auth
class IsAuthenticatedGuard {
  canActivate() {
    return true;
  }
}

@Controller('campaign')
@UseGuards(IsAuthenticatedGuard)
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    try {
      const newCampaign = await this.campaignService.createNewCampaign(createCampaignDto);
      return newCampaign;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get()
  async listCampaignNear(@Query() queryCampaignDto: QueryCampaignDto) {
    const except = !!queryCampaignDto['id.except'];
    const helper = !!queryCampaignDto['id.helper'];
    let temp: string | null = null;
    
    if (except) {
      temp = 'except';
    } else if (helper) {
      temp = 'helper';
    }

    const id = temp ? queryCampaignDto[`id.${temp}` as keyof QueryCampaignDto] as string : queryCampaignDto.id || null;
    const categoryArray = queryCampaignDto.categoryId
      ? queryCampaignDto.categoryId.split(',')
      : null;

    const near = !!queryCampaignDto.near;
    const coords = near
      ? queryCampaignDto.coords?.split(',').map((coord) => Number(coord)) || null
      : null;

    try {
      let result;
      if (near && coords) {
        result = await this.campaignService.getNearCampaignList(
          coords,
          except,
          id,
          categoryArray,
        );
      }
      return result;
    } catch (err) {
      console.log(err);
      return { error: err.message };
    }
  }

  @Get('listbyStatus/:userId')
  async getCampaignListByStatus(
    @Param() paramCampaignWithUserIdDto: ParamCampaignWithUserIdDto,
    @Query('statusList') statusList: string,
  ) {
    const { userId } = paramCampaignWithUserIdDto;
    const statusListArray = statusList.split(',');

    try {
      const result = await this.campaignService.getCampaignListByStatus({
        userId,
        statusList: statusListArray,
      });
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Put(':id')
  async finishCampaign(@Param() paramCampaignDto: ParamCampaignDto) {
    const { id } = paramCampaignDto;
    
    try {
      const result = await this.campaignService.finishCampaign(id);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Delete(':id')
  async deleteCampaignLogic(@Param() paramCampaignDto: ParamCampaignDto) {
    const { id } = paramCampaignDto;
    
    try {
      const result = await this.campaignService.deleteCampaign(id);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get(':id')
  async getCampaignById(@Param() paramCampaignDto: ParamCampaignDto) {
    const { id } = paramCampaignDto;
    
    try {
      const result = await this.campaignService.getCampaignById(id);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }
} 