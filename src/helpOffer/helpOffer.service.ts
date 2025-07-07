import { Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { HelpOfferRepository } from './helpOffer.repository';
import { HelpOffer } from './schemas/helpOffer.schema';
import { CreateHelpOfferDto } from './dto/CreateHelpOffer.dto';
import { UserService } from 'src/user/user.service';
import { EntityService } from 'src/entity/entity.service';

@Injectable()
export class HelpOfferService {
  constructor(
    private helpOfferRepository: HelpOfferRepository,
    private userService: UserService,
    private entityService: EntityService,
    // private notificationService: NotificationService,
    // private notificationMixin: NotificationMixin,
  ) {}

  async createNewHelpOffer(offeredHelpInfo: CreateHelpOfferDto): Promise<HelpOffer> {
    // Convert string arrays to ObjectId arrays
    const helpOfferData = {
      ...offeredHelpInfo,
      ownerId: new Types.ObjectId(offeredHelpInfo.ownerId),
      categoryId: offeredHelpInfo.categoryId?.map(id => new Types.ObjectId(id)),
      possibleHelpedUsers: offeredHelpInfo.possibleHelpedUsers?.map(id => new Types.ObjectId(id)),
      possibleEntities: offeredHelpInfo.possibleEntities?.map(id => new Types.ObjectId(id)),
      helpedUserId: offeredHelpInfo.helpedUserId?.map(id => new Types.ObjectId(id)),
    };
    
    const newOfferedHelp = await this.helpOfferRepository.create(helpOfferData);
    
    const title = 'Oferta criada próximo a você';
    const body = 'Entre no aplicativo para conferir.';
    
    // this.notificationService.notifyNearUsers(title, body, newOfferedHelp.ownerId.toString());
    
    return newOfferedHelp;
  }

  async getHelpOfferWithAggregationById(id: string): Promise<HelpOffer> {
    const help = await this.helpOfferRepository.getByIdWithAggregation(id);

    if (!help) {
      throw new BadRequestException('Oferta não encontrada');
    }

    return help;
  }

  async listHelpsOffers(
    userId: string,
    isUserEntity: boolean,
    categoryArray: string[] | null,
    getOtherUsers: boolean,
    coords: number[] | null,
  ): Promise<HelpOffer[]> {
    const helpOffers = await this.helpOfferRepository.list(
      userId,
      isUserEntity,
      categoryArray,
      getOtherUsers,
      coords,
    );
    return helpOffers;
  }

  async listHelpsOffersByOwnerId(ownerId: string): Promise<HelpOffer[]> {
    const helpOffers = await this.helpOfferRepository.listByOwnerId(ownerId);
    return helpOffers;
  }

  async listHelpOffersByHelpedUserId(helpedUserId: string): Promise<HelpOffer[]> {
    const helpOffers = await this.helpOfferRepository.listByHelpedUserId(helpedUserId);
    return helpOffers;
  }

  validateOwnerAndHelpedUser(helpedId: string, helpOffer: HelpOffer): void {
    if (helpOffer.ownerId.toString() === helpedId) {
      throw new BadRequestException('Dono não pode ser ajudado da própria oferta');
    } else if (helpOffer.helpedUserId && helpOffer.helpedUserId.some(id => id.toString() === helpedId)) {
      throw new BadRequestException('Usuário já está sendo ajudado');
    }
  }

  validateOwner(helpOffer: HelpOffer, email: string): void {
    if ((helpOffer as any).user?.email !== email) {
      throw new BadRequestException('Usuário não autorizado');
    }
  }

  isUserInPossibleHelpedUsers(helpedUser: any, helpOffer: HelpOffer, helpedId: string): boolean {
    if (!helpedUser.isEntity) {
      return helpOffer.possibleHelpedUsers.some(id => id.toString() === helpedId);
    }
    return helpOffer.possibleEntities.some(id => id.toString() === helpedId);
  }

  possibleInterestedArray(helpOffer: HelpOffer, helpedUser: any): Types.ObjectId[] {
    if (helpedUser.isEntity) {
      return helpOffer.possibleEntities;
    }
    return helpOffer.possibleHelpedUsers;
  }

  async addPossibleHelpedUsers(helpedId: string, helpOfferId: string): Promise<void> {
    const helpOffer = await this.getHelpOfferById(helpOfferId);
    const helpedUser = await this.verifyUserEntity(helpedId);
    const possibleHelpedUser = this.possibleInterestedArray(helpOffer, helpedUser);

    // Validação
    this.validateOwnerAndHelpedUser(helpedId, helpOffer);
    if (this.isUserInPossibleHelpedUsers(helpedUser, helpOffer, helpedId)) {
      throw new BadRequestException('Usuário já é um possível ajudado');
    }

    // Alteração do array
    possibleHelpedUser.push(new Types.ObjectId(helpedId));
    await this.helpOfferRepository.update(helpOffer);

    // Notificação
    const ownerProjection = { deviceId: 1, _id: 0 };
    // const { deviceId: ownerDeviceId } = await this.userService.findOneUserWithProjection(
    //   helpOffer.ownerId.toString(),
    //   ownerProjection
    // );

    const title = `${helpedUser.name} quer sua ajuda!`;
    const body = `Sua oferta ${helpOffer.title} recebeu um interessado`;

    // await this.sendHelpOfferNotification(
    //   ownerDeviceId,
    //   title,
    //   body,
    //   helpOffer.ownerId.toString(),
    //   helpOfferId,
    //   'ofertaRequerida',
    // );
  }

  async addHelpedUsers(helpedId: string, helpOfferId: string): Promise<void> {
    const helpOffer = await this.getHelpOfferById(helpOfferId);
    const helpedUser = await this.verifyUserEntity(helpedId);
    const interestedArray = this.possibleInterestedArray(helpOffer, helpedUser);

    // Validação
    this.validateOwnerAndHelpedUser(helpedId, helpOffer);
    if (!this.isUserInPossibleHelpedUsers(helpedUser, helpOffer, helpedId)) {
      throw new BadRequestException('Usuário não é um interessado na ajuda');
    }

    // Alteração do array
    helpOffer.helpedUserId.push(new Types.ObjectId(helpedId));
    const index = interestedArray.findIndex(id => id.toString() === helpedId);
    if (index > -1) {
      interestedArray.splice(index, 1);
    }
    await this.helpOfferRepository.update(helpOffer);

    // Notificação
    const ownerProjection = { name: 1, _id: 0 };
    // const { name: ownerName } = await this.userService.findOneUserWithProjection(
    //   helpOffer.ownerId.toString(),
    //   ownerProjection
    // );

    const title = `Escolheu ajudar você!`; // `${ownerName} escolheu ajudar você!`
    const body = `Você foi escolhido para ser ajudado na oferta ${helpOffer.title}`;

    // await this.sendHelpOfferNotification(
    //   helpedUser.deviceId,
    //   title,
    //   body,
    //   helpedId,
    //   helpOfferId,
    //   'ofertaAceita',
    // );
  }

  async verifyUserEntity(helpedId: string): Promise<any> {
    let helpedUserProjection: any = {
      name: 1, deviceId: 1, cpf: 1, _id: 0,
    };
    let helpedUserName;

    helpedUserName = await this.userService.findOneUserWithProjection(helpedId, helpedUserProjection);
    if (helpedUserName == null) {
      helpedUserProjection = {
        name: 1, deviceId: 1, cnpj: 1, _id: 0,
      };
      helpedUserName = await this.entityService.findOneEntityWithProjection(helpedId, helpedUserProjection);
    }

    const isUserEntity = (!!helpedUserName.cnpj);
    return { name: helpedUserName.name, deviceId: helpedUserName.deviceId, isEntity: isUserEntity };
  }

  async sendHelpOfferNotification(
    deviceId: string,
    title: string,
    body: string,
    userId: string,
    helpOfferId: string,
    notificationType: string,
  ): Promise<void> {
    const notificationHistory = {
      userId,
      helpId: helpOfferId,
      isOffer: true,
      title,
      body,
      notificationType,
    };

    try {
      // await this.notificationMixin.sendNotification(deviceId, title, body);
      // await this.notificationService.createNotification(notificationHistory);
    } catch (err) {
      console.log('Não foi possível enviar a notificação!');
      // saveError(err);
    }
  }

  async getHelpOfferById(helpOfferId: string): Promise<HelpOffer> {
    const helpOffer = await this.helpOfferRepository.getById(helpOfferId);
    if (!helpOffer) {
      throw new BadRequestException('Help offer not found');
    }
    return helpOffer;
  }

  async finishHelpOfferByOwner(helpOfferId: string, email: string): Promise<void> {
    const query = { _id: new Types.ObjectId(helpOfferId) };
    const helpOfferProjection = ['ownerId', 'categoryId', 'active'];
    const owner = {
      path: 'user',
      select: 'email',
    };
    
    let helpOffer = await this.helpOfferRepository.findOne(query, helpOfferProjection, owner);

    if (!helpOffer) {
      throw new BadRequestException('Help offer not found');
    }

    this.validateOwner(helpOffer, email);

    await this.helpOfferRepository.finishHelpOfferByOwner(helpOffer);

    // WebSocket message would be sent here
    // const sendSocketMessageTo = findConnections(helpOffer.categoryId, helpOffer.ownerId.toString());
    // sendMessage(sendSocketMessageTo, 'delete-help-offer', helpOfferId);
  }

  async getEmailByHelpOfferId(helpOfferId: string): Promise<string> {
    const ownerEmail = await this.helpOfferRepository.getEmailByHelpOfferId(helpOfferId);
    return ownerEmail;
  }
} 