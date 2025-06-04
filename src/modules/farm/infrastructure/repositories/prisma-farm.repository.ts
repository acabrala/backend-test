import { PrismaClient } from '@prisma/client';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Crop } from '@/crop/domain/entities/crop.entity';

@Injectable()
export class PrismaFarmRepository implements IFarmRepository {
  private readonly logger = new Logger(PrismaFarmRepository.name);

  constructor(private readonly prisma: PrismaClient) {}

  async create(farm: Farm): Promise<Farm> {
    this.logger.log(
      `Criando fazenda: ${farm.name} (producerId=${farm.producerId})`,
    );

    try {
      const created = await this.prisma.farm.create({
        data: {
          id: farm.id,
          name: farm.name,
          city: farm.city,
          state: farm.state,
          totalArea: farm.totalArea,
          cultivableArea: farm.cultivableArea,
          vegetationArea: farm.vegetationArea,
          producerId: farm.producerId,
        },
      });

      this.logger.log(`Fazenda criada com sucesso: ${created.id}`);
      return new Farm(
        created.id,
        created.name,
        created.city,
        created.state,
        created.totalArea,
        created.cultivableArea,
        created.vegetationArea,
        created.producerId,
        [],
      );
    } catch (error) {
      this.logger.error(`Erro ao criar fazenda ${farm.name}`, error.stack);
      throw error;
    }
  }

  async update(id: string, farm: Farm): Promise<Farm> {
    this.logger.log(`Atualizando fazenda id=${id}`);

    try {
      const updated = await this.prisma.farm.update({
        where: { id },
        data: {
          name: farm.name,
          city: farm.city,
          state: farm.state,
          totalArea: farm.totalArea,
          cultivableArea: farm.cultivableArea,
          vegetationArea: farm.vegetationArea,
        },
      });

      this.logger.log(`Fazenda atualizada com sucesso: ${updated.id}`);
      return new Farm(
        updated.id,
        updated.name,
        updated.city,
        updated.state,
        updated.totalArea,
        updated.cultivableArea,
        updated.vegetationArea,
        updated.producerId,
        [],
      );
    } catch (error) {
      this.logger.error(`Erro ao atualizar fazenda id=${id}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deletando fazenda id=${id}`);

    try {
      await this.prisma.farm.delete({ where: { id } });
      this.logger.log(`Fazenda id=${id} deletada com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao deletar fazenda id=${id}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<Farm | null> {
    this.logger.log(`Buscando fazenda pelo id=${id}`);

    try {
      const found = await this.prisma.farm.findUnique({ where: { id } });
      if (!found) {
        this.logger.warn(`Fazenda não encontrada pelo id=${id}`);
        return null;
      }

      this.logger.log(`Fazenda encontrada: ${found.id}`);
      return new Farm(
        found.id,
        found.name,
        found.city,
        found.state,
        found.totalArea,
        found.cultivableArea,
        found.vegetationArea,
        found.producerId,
        [],
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar fazenda pelo id=${id}`, error.stack);
      throw error;
    }
  }

  async findByProducerId(producerId: string): Promise<Farm[]> {
    this.logger.log(`Buscando fazendas do producerId=${producerId}`);

    try {
      const farms = await this.prisma.farm.findMany({
        where: { producerId },
        include: { crops: true },
      });
      this.logger.log(
        `Foram encontradas ${farms.length} fazendas para producerId=${producerId}`,
      );

      return farms.map(
        (f) =>
          new Farm(
            f.id,
            f.name,
            f.city,
            f.state,
            f.totalArea,
            f.cultivableArea,
            f.vegetationArea,
            f.producerId,
            f.crops.map(
              (c) =>
                new Crop(
                  c.id,
                  c.farmId,
                  c.name,
                  c.plantedArea,
                  c.plantedAt,
                  c.harvestedAt ?? undefined,
                ),
            ),
          ),
      );
    } catch (error) {
      this.logger.error(
        `Erro ao buscar fazendas para producerId=${producerId}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(): Promise<Farm[]> {
    try {
      const farmRecords = await this.prisma.farm.findMany();

      const farms = farmRecords.map(
        (f) =>
          new Farm(
            f.id,
            f.name,
            f.city,
            f.state,
            f.totalArea,
            f.cultivableArea,
            f.vegetationArea,
            f.producerId,
            [],
          ),
      );

      return farms;
    } catch (err) {
      this.logger.error('Erro ao buscar fazendas', err.stack);
      throw err;
    }
  }
}
