import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';

interface CreateFarmDto {
  id?: string;
  name: string;
  city: string;
  state: string;
  totalArea: number;
  cultivableArea: number;
  vegetationArea: number;
  producerId: string;
}

@Injectable()
export class CreateFarmUseCase {
  private readonly logger = new Logger(CreateFarmUseCase.name);

  constructor(
    @Inject('IFarmRepository')
    private readonly farmRepo: IFarmRepository,
  ) {}

  async execute(dto: CreateFarmDto): Promise<Farm> {
    this.logger.log(
      `Iniciando criação da fazenda para produtorId=${dto.producerId}`,
    );

    try {
      if (dto.totalArea <= 0) {
        this.logger.warn(
          'Tentativa de criar fazenda com área total menor ou igual a zero',
        );
        throw new BadRequestException(
          'Área da fazenda deve ser maior que zero.',
        );
      }

      if (dto.cultivableArea < 0 || dto.vegetationArea < 0) {
        this.logger.warn('Tentativa de criar fazenda com área negativa');
        throw new BadRequestException(
          'Área agricultável e área de vegetação não podem ser negativas.',
        );
      }

      const farm = new Farm(
        dto.id ?? undefined,
        dto.name,
        dto.city,
        dto.state,
        dto.totalArea,
        dto.cultivableArea,
        dto.vegetationArea,
        dto.producerId,
        [],
      );

      const createdFarm = await this.farmRepo.create(farm);

      this.logger.log(`Fazenda criada com sucesso: id=${createdFarm.id}`);

      return createdFarm;
    } catch (error) {
      this.logger.error(
        'Erro ao criar fazenda',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
