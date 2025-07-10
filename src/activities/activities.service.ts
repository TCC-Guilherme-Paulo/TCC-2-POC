import { Injectable } from '@nestjs/common';
import { HelpRepository } from '../help/help.repository';
import { sortActivitiesByDistance } from '../utils/sortActivitiesByDistance';
import { HelpOfferRepository } from 'src/helpOffer/helpOffer.repository';
import { CampaignRepository } from 'src/campaign/campaign.repository';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly helpRepository: HelpRepository,
    private readonly helpOfferRepository: HelpOfferRepository,
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async fetchActivityList(
    coords: number[],
    id: string,
    isUserEntity: boolean,
    getOtherUsers: boolean,
    categoryArray?: string[],
    activitiesArray?: string[]
  ): Promise<object[]> {
    const promises:Promise<object[]>[] = [];

    const mappedActivitiesRepositories = {
      help: () => this.helpRepository.shortList(coords, id, isUserEntity, categoryArray),
      helpOffer: () => this.helpOfferRepository.list(id, isUserEntity, categoryArray, getOtherUsers, coords),
      campaign: () => this.campaignRepository.listNear(coords, true, id, categoryArray),
    };

    activitiesArray?.forEach((activity) => {
      if (mappedActivitiesRepositories[activity]) {
        promises.push(mappedActivitiesRepositories[activity]());
      }
    });

    if (!promises.length) {
      const promisesList = Promise.all([
        mappedActivitiesRepositories.help(),
        mappedActivitiesRepositories.helpOffer(),
        mappedActivitiesRepositories.campaign(),
      ]);
      promises.push(promisesList);
    }

    const activitiesList = await Promise.all(promises);

    const flattedList = activitiesList.flat(2);

    return sortActivitiesByDistance({ helpList: flattedList });
  }
}
