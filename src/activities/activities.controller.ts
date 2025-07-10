import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async fetchActivityList(
    @Query('id') id: string,
    @Query('isUserEntity') isUserEntity: boolean,
    @Query('getOtherUsers') getOtherUsers: boolean | string,
    @Query('coords') coords: string,
    @Query('categoryId') categoryId?: string,
    @Query('activityId') activityId?: string,
  ) {
    try {
      const parsedCoords = coords ? coords.split(',').map(Number) : [];
      const categoryArray = categoryId ? categoryId.split(',') : [];
      const activitiesArray = activityId ? activityId.split(',') : ['getAll'];
      const getOtherUsersParam = getOtherUsers === 'true'

      return await this.activitiesService.fetchActivityList(
        parsedCoords,
        id,
        isUserEntity,
        getOtherUsersParam,
        categoryArray,
        activitiesArray,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
