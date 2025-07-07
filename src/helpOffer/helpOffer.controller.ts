import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HelpOfferService } from './helpOffer.service';
import { CreateHelpOfferDto } from './dto/CreateHelpOffer.dto';
import { QueryHelpOfferDto } from './dto/QueryHelpOffer.dto';
import { ParamHelpOfferDto, ParamHelpOfferWithHelpedIdDto, ParamHelpOfferWithHelpedUserIdDto } from './dto/ParamHelpOffer.dto';

@Controller('helpOffer')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class HelpOfferController {
  constructor(private helpOfferService: HelpOfferService) {}

  @Post()
  async createHelpOffer(@Body() createHelpOfferDto: CreateHelpOfferDto, @Req() req: any) {
    try {
      const newHelpOffer = await this.helpOfferService.createNewHelpOffer(createHelpOfferDto);
      
      // Timeline event creation would be here
      // await this.timelineEventService.create({ 
      //   user: createHelpOfferDto.ownerId, 
      //   template: timelineEnum.offer 
      // });
      
      return newHelpOffer;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('list')
  async listHelpsOffers(@Query() queryHelpOfferDto: QueryHelpOfferDto, @Req() req: any) {
    const { userId } = queryHelpOfferDto;
    const getOtherUsers = queryHelpOfferDto.getOtherUsers || false;
    const isUserEntity = false; // This would come from global context in real app
    const coords = queryHelpOfferDto.coords?.split(',').map((coord) => Number(coord)) || null;
    
    if (!userId) {
      return { error: 'userId is required' };
    }
    
    try {
      const helpOffers = await this.helpOfferService.listHelpsOffers(
        userId,
        isUserEntity,
        null,
        getOtherUsers,
        coords,
      );
      return helpOffers;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('aggregation/:id')
  async getHelpWithAggregationById(@Param() paramHelpOfferDto: ParamHelpOfferDto) {
    const { id } = paramHelpOfferDto;

    try {
      const result = await this.helpOfferService.getHelpOfferWithAggregationById(id);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get('list/:helpedUserId')
  async listHelpOffersByHelpedUserId(@Param() paramHelpOfferWithHelpedUserIdDto: ParamHelpOfferWithHelpedUserIdDto) {
    const { helpedUserId } = paramHelpOfferWithHelpedUserIdDto;
    
    try {
      const helpOffers = await this.helpOfferService.listHelpOffersByHelpedUserId(helpedUserId);
      return helpOffers;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Put('possibleHelpedUsers/:helpedId/:helpOfferId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addPossibleHelpedUsers(@Param() paramHelpOfferWithHelpedIdDto: ParamHelpOfferWithHelpedIdDto) {
    const { helpedId, helpOfferId } = paramHelpOfferWithHelpedIdDto;
    
    try {
      await this.helpOfferService.addPossibleHelpedUsers(helpedId, helpOfferId);
      return;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Put('chooseHelpedUsers/:helpedId/:helpOfferId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async chooseHelpedUsers(@Param() paramHelpOfferWithHelpedIdDto: ParamHelpOfferWithHelpedIdDto) {
    const { helpedId, helpOfferId } = paramHelpOfferWithHelpedIdDto;
    
    try {
      await this.helpOfferService.addHelpedUsers(helpedId, helpOfferId);
      return;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':helpOfferId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async finishHelpOfferByOwner(@Param('helpOfferId') helpOfferId: string, @Req() req: any) {
    const email = req.decodedToken?.email || 'mock@email.com'; // Mock for demonstration

    try {
      await this.helpOfferService.finishHelpOfferByOwner(helpOfferId, email);
      return;
    } catch (error) {
      return { error: error.message };
    }
  }
} 