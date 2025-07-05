import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; TBD
import { HelpRepository } from './help.repository';
import { UserService } from '../user/user.service';
import { EntityService } from '../entity/entity.service';
import { CategoryService } from '../category/category.service';
import { HelpStatus } from './enums/HelpStatus.enum';
import { CreateHelpDto } from './dto/CreateHelpDto';
import { ChooseHelperDto } from './dto/ChooseHelperDto';
import { ConfirmationDto } from './dto/ConfirmationDto';
import { GetHelpListByStatusDto } from './dto/GetHelpListByStatusDto';
import { Types } from 'mongoose';

@Injectable()
export class HelpService {
  constructor(
    private readonly helpRepository: HelpRepository,
    private readonly userService: UserService,
    private readonly entityService: EntityService,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,

    // TBD 
    // @Inject('NOTIFICATION_CLIENT')
    // private readonly notificationClient: ClientProxy,

    // TBD
    // @Inject('SOCKET_CLIENT')
    // private readonly socketClient: ClientProxy,
  ) {}


  async createHelp(dto: CreateHelpDto) {
    const totalByOwner = await this.helpRepository.countByOwner(dto.ownerId);
    if (totalByOwner >= 15) {
      throw new BadRequestException('Limite máximo de pedidos atingido');
    }

    await this.categoryService.getCategoryById(dto.categoryId);

    const help = await this.helpRepository.create(dto);

    // TBD
    // this.socketClient.emit('help.created', {
    //   helpId: help._id,
    //   ownerId: help.ownerId,
    //   categoryId: help.categoryId,
    // });

    // this.notificationClient.emit('help.near-users', {
    //   helpId: help._id,
    //   ownerId: help.ownerId,
    //   categoryId: help.categoryId,
    // });

    return help;
  }

  async getHelpById(id: string) {
    const help = await this.helpRepository.getById(id);
    if (!help) throw new NotFoundException('Ajuda não encontrada');
    return help;
  }

  async getHelpWithAggregationById(id: string) {
    const help = await this.helpRepository.getByIdWithAggregation(id);
    if (!help) throw new NotFoundException('Ajuda não encontrada');
    return help;
  }

  async getHelpList(
    coords: [number, number],
    id: string,
    isUserEntity: boolean,
    categoryArray: string[],
  ) {
    const list = await this.helpRepository.shortList(
      coords,
      id,
      isUserEntity,
      categoryArray,
    );
    if (!list || list.length === 0) {
      throw new NotFoundException(
        'Pedidos de ajuda não encontrados no seu raio de distância',
      );
    }
    return list;
  }

  async deleteHelpLogically(id: string) {
    const help = await this.getHelpById(id);
    help.active = false;
    await this.helpRepository.update(help);

    // TBD
    // this.socketClient.emit('help.deleted', {
    //   helpId: help._id,
    //   ownerId: help.ownerId,
    //   categoryId: help.categoryId,
    // });
  }

  async getHelpListByStatus(dto: GetHelpListByStatusDto) {
    const { userId, statusList, helper } = dto;
    const invalid = statusList.filter((s) => !Object.values(HelpStatus).includes(s));
    if (invalid.length) throw new BadRequestException('Status inválido');
    if (typeof helper !== 'boolean') {
      throw new BadRequestException('O campo "helper" deve ser booleano');
    }
    return this.helpRepository.getHelpListByStatus(userId, statusList, helper);
  }

  async chooseHelper(dto: ChooseHelperDto) {
    const { idHelp, idHelper } = dto;
    const help = await this.getHelpById(idHelp);
    const helperObjectId = new Types.ObjectId(idHelper);

    if (help.helperId) {
      throw new BadRequestException('Ajuda já possui ajudante');
    }

    if (!help.possibleHelpers.includes(helperObjectId) && !help.possibleEntities.includes(helperObjectId)) {
      throw new BadRequestException('Ajudante não encontrado entre as ofertas');
    }

    help.helperId = helperObjectId;
    help.status = HelpStatus.ON_GOING;
    help.possibleHelpers = [];
    help.possibleEntities = [];
    await this.helpRepository.update(help);

    // TBD
    // this.socketClient.emit('help.accepted', {
    //   helpId: help._id,
    //   helperId: idHelper,
    //   ownerId: help.ownerId,
    // });

    // this.notificationClient.emit('help.accepted', {
    //   helpId: help._id,
    //   helperId: idHelper,
    //   ownerId: help.ownerId,
    // });

    return help;
  }

  async helperConfirmation(dto: ConfirmationDto) {
    const help = await this.getHelpById(dto.helpId);

    if (help.helperId?.toString() !== dto.helperId) {
      throw new BadRequestException('Usuário não é o ajudante desta ajuda');
    }

    if (help.status === HelpStatus.FINISHED) {
      throw new BadRequestException('Ajuda já finalizada');
    }

    if (help.status === HelpStatus.OWNER_FINISHED) {
      help.status = HelpStatus.FINISHED;
      await this.helpRepository.update(help);
      this.publishFinishEvents(help);
      return help;
    }

    if (help.status === HelpStatus.HELPER_FINISHED) {
      throw new BadRequestException('Usuário já confirmou a finalização');
    }

    help.status = HelpStatus.HELPER_FINISHED;
    await this.helpRepository.update(help);
    return help;
  }

  async ownerConfirmation(dto: ConfirmationDto) {
    const help = await this.getHelpById(dto.helpId);

    if (help.ownerId.toString() !== dto.ownerId) {
      throw new BadRequestException('Usuário não é o dono da ajuda');
    }

    if (help.status === HelpStatus.FINISHED) {
      throw new BadRequestException('Ajuda já finalizada');
    }

    if (help.status === HelpStatus.HELPER_FINISHED) {
      help.status = HelpStatus.FINISHED;
      await this.helpRepository.update(help);
      this.publishFinishEvents(help);
      return help;
    }

    if (help.status === HelpStatus.OWNER_FINISHED) {
      throw new BadRequestException('Usuário já confirmou a finalização');
    }

    help.status = HelpStatus.OWNER_FINISHED;
    await this.helpRepository.update(help);
    return help;
  }

  async addPossibleHelpers(helpId: string, profileId: string) {
    const help = await this.getHelpById(helpId);

    if (profileId === help.ownerId.toString()) {
      throw new BadRequestException('Você não pode ajudar seu próprio pedido');
    }

    if (help.helperId) {
      throw new BadRequestException('Ajuda já possui ajudante');
    }

    const profile = await this.resolveProfile(profileId);
    const isUser = 'cpf' in profile;
    const profileObjectId = new Types.ObjectId(profileId);

    const alreadyInserted = isUser
      ? help.possibleHelpers.includes(profileObjectId)
      : help.possibleEntities.includes(profileObjectId);
    if (alreadyInserted) {
      throw new BadRequestException('Oferta já registrada');
    }

    if (isUser) {
      help.possibleHelpers.push(profileObjectId);
    } else {
      help.possibleEntities.push(profileObjectId);
    }
    await this.helpRepository.update(help);

    // TBD
    // this.notificationClient.emit('help.offer-created', {
    //   helpId: help._id,
    //   ownerId: help.ownerId,
    //   helperId: profileId,
    // });

    return help;
  }

  async getListToDelete() {
    return this.helpRepository.listToExpire();
  }

  async getHelpInfoById(helpId: string) {
    const info = await this.helpRepository.getHelpInfoById(helpId);
    if (!info) throw new NotFoundException('Pedido de ajuda não encontrado');
    return info;
  }

  private async resolveProfile(id: string) {
    try {
      return await this.userService.getById(id);
    } catch {
      return this.entityService.getById(id);
    }
  }

  private publishFinishEvents(help: any) {
    // TBD
    // this.socketClient.emit('help.finished', {
    //   helpId: help._id,
    //   ownerId: help.ownerId,
    //   helperId: help.helperId,
    // });
    // this.notificationClient.emit('help.finished', {
    //   helpId: help._id,
    //   ownerId: help.ownerId,
    //   helperId: help.helperId,
    // });
  }
}
