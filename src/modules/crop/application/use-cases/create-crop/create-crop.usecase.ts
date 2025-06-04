import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { ICropRepository } from '@/crop/domain/repositories/crop.repository.interface';
import { Crop } from '@/crop/domain/entities/crop.entity';

interface AddCropDto {
  farmId: string;
  cropName: string;
  cropArea: number;
  plantedAt: Date;
  harvestedAt?: Date;
}

@Injectable()
export class AddCropUseCase {
  private readonly logger = new Logger(AddCropUseCase.name);

  constructor(
    @Inject('IFarmRepository')
    private readonly farmRepo: IFarmRepository,

    @Inject('ICropRepository')
    private readonly cropRepo: ICropRepository,
  ) {}

  async execute(dto: AddCropDto): Promise<void> {
    this.logger.log(`Adicionando safra à fazenda ${dto.farmId}`);

    const farm = await this.farmRepo.findById(dto.farmId);
    if (!farm) {
      this.logger.warn(`Fazenda não encontrada: ${dto.farmId}`);
      throw new NotFoundException('Fazenda não encontrada');
    }

    const crop = new Crop(
      null,
      dto.farmId,
      dto.cropName,
      dto.cropArea,
      dto.plantedAt,
      dto.harvestedAt,
    );

    try {
      await this.cropRepo.create(crop);
      this.logger.log(`Safra adicionada com sucesso à fazenda ${dto.farmId}`);
    } catch (error) {
      this.logger.error(
        `Erro ao adicionar safra à fazenda ${dto.farmId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao adicionar safra');
    }
  }
}
