import { PrismaClient } from '@prisma/client';
import { ICropRepository } from '@/crop/domain/repositories/crop.repository.interface';
import { Crop } from '@/crop/domain/entities/crop.entity';
import {
  Logger,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class PrismaCropRepository implements ICropRepository {
  private readonly logger = new Logger(PrismaCropRepository.name);

  constructor(private readonly prisma: PrismaClient) {}

  async create(crop: Crop): Promise<Crop> {
    try {
      const created = await this.prisma.crop.create({
        data: {
          id: crop.id,
          farmId: crop.farmId,
          name: crop.name,
          plantedArea: crop.plantedArea,
          plantedAt: crop.plantedAt,
          harvestedAt: crop.harvestedAt ?? null,
        },
      });

      return new Crop(
        created.id,
        created.farmId,
        created.name,
        created.plantedArea,
        created.plantedAt,
        created.harvestedAt ?? undefined,
      );
    } catch (error) {
      this.logger.error('Erro ao criar crop no banco de dados', error.stack);
      throw new InternalServerErrorException(
        'Erro ao salvar safra no banco de dados',
      );
    }
  }

  async findAll(): Promise<Crop[]> {
    try {
      const cropRecords = await this.prisma.crop.findMany();

      const crops = cropRecords.map(
        (c) =>
          new Crop(
            c.id,
            c.farmId,
            c.name,
            c.plantedArea,
            c.plantedAt,
            c.harvestedAt ?? undefined,
          ),
      );

      return crops;
    } catch (error) {
      this.logger.error('Erro ao buscar safra no banco de dados', error.stack);
      throw new InternalServerErrorException(
        'Erro ao buscar safra no banco de dados',
      );
    }
  }
}
