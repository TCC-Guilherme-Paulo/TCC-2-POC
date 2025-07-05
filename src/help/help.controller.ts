import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseBoolPipe,
  ParseArrayPipe,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { HelpService } from './help.service';
import { ChooseHelperDto } from './dto/ChooseHelperDto';
import { ConfirmationDto } from './dto/ConfirmationDto';
import { CreateHelpDto } from './dto/CreateHelpDto';
import { GetHelpListByStatusDto } from './dto/GetHelpListByStatusDto';
import { HelpStatus } from './enums/HelpStatus.enum';

@Controller('help')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Post()
  async create(@Body() dto: CreateHelpDto) {
    return this.helpService.createHelp(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.helpService.getHelpById(id);
  }

  @Get(':id/detail')
  async findByIdWithAggregation(@Param('id') id: string) {
    return this.helpService.getHelpWithAggregationById(id);
  }

  @Delete(':id')
  async deleteHelp(@Param('id') id: string) {
    await this.helpService.deleteHelpLogically(id);
    return { success: true };
  }

  @Get()
  async shortList(
    @Query('coords', new ParseArrayPipe({ separator: ',', items: Number })) coords: number[],
    @Query('id') id: string,
    @Query('isUserEntity', ParseBoolPipe) isUserEntity = false,
    @Query('categories', new ParseArrayPipe({ separator: ',', items: String, optional: true })) categories?: string[],
  ) {
    if (coords.length !== 2) {
      throw new BadRequestException('Coordinates must be exactly two numbers [latitude, longitude]');
    }
    return this.helpService.getHelpList(
      coords as [number, number],
      id,
      isUserEntity,
      categories ?? []
    );
  }

  @Get('status/list')
  async listByStatus(
    @Query('userId') userId: string,
    @Query('statusList', new ParseArrayPipe({ separator: ',', items: String })) statusList: HelpStatus[],
    @Query('helper', ParseBoolPipe) helper = false,
  ) {
    const dto: GetHelpListByStatusDto = { userId, statusList, helper } as any;
    return this.helpService.getHelpListByStatus(dto);
  }

  @Patch(':id/choose-helper')
  async chooseHelper(@Param('id') id: string, @Body() { idHelper }: { idHelper: string }) {
    const dto: ChooseHelperDto = { idHelp: id, idHelper };
    return this.helpService.chooseHelper(dto);
  }

  @Patch(':id/helper-confirmation')
  async helperConfirmation(@Param('id') id: string, @Body('helperId') helperId: string) {
    const dto: ConfirmationDto = { helpId: id, helperId };
    return this.helpService.helperConfirmation(dto);
  }

  @Patch(':id/owner-confirmation')
  async ownerConfirmation(@Param('id') id: string, @Body('ownerId') ownerId: string) {
    const dto: ConfirmationDto = { helpId: id, ownerId };
    return this.helpService.ownerConfirmation(dto);
  }

  @Patch(':id/add-helper')
  async addPossibleHelper(@Param('id') id: string, @Body('profileId') profileId: string) {
    return this.helpService.addPossibleHelpers(id, profileId);
  }
}
