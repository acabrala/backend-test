import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { Producer } from '@/producer/domain/entities/producer.entity';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaProducerRepository implements IProducerRepository {
  private readonly logger = new Logger(PrismaProducerRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private toFarmDomain(prismaFarm: any): Farm {
    return new Farm(
      prismaFarm.id,
      prismaFarm.name,
      prismaFarm.city,
      prismaFarm.state,
      prismaFarm.totalArea,
      prismaFarm.cultivableArea,
      prismaFarm.vegetationArea,
      prismaFarm.producerId,
      [], // crops initialized as empty array
    );
  }

  private toProducerDomain(
    prismaProducer: any,
    includeFarms: boolean = true,
  ): Producer {
    let farms: Farm[] = [];
    if (includeFarms && prismaProducer.farms) {
      farms = prismaProducer.farms.map((farm: any) =>
        this.toFarmDomain(farm),
      );
    }
    return new Producer(
      prismaProducer.document,
      prismaProducer.name,
      farms,
      prismaProducer.id,
    );
  }

  async findByDocument(document: string): Promise<Producer | null> {
    this.logger.log(`Buscando producer pelo documento: ${document}`);

    const data = await this.prisma.producer.findUnique({
      where: { document },
    });
    if (!data) {
      this.logger.warn(`Producer não encontrado para documento: ${document}`);
      return null;
    }

    this.logger.log(`Producer encontrado: ${data.id}`);
    return this.toProducerDomain(data, false);
  }

  async findById(id: string): Promise<Producer | null> {
    this.logger.log(`Buscando producer pelo ID: ${id}`);
    const data = await this.prisma.producer.findUnique({
      where: { id },
      // include: { farms: true } // Farms not included by default
    });
    if (!data) {
      this.logger.warn(`Producer não encontrado para ID: ${id}`);
      return null;
    }
    this.logger.log(`Producer encontrado: ${data.id}`);
    return this.toProducerDomain(data, false);
  }

  async create(producer: Producer): Promise<Producer> {
    this.logger.log(`Criando producer: ${producer.cpfCnpj}`);

    try {
      const created = await this.prisma.producer.create({
        data: {
          name: producer.name,
          document: producer.cpfCnpj,
        },
      });

      this.logger.log(`Producer criado com sucesso: ${created.id}`);

      return this.toProducerDomain(created, false);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Producer com document ${producer.cpfCnpj} já existe.`,
        );
        throw new ConflictException(
          `Producer com CPF/CNPJ ${producer.cpfCnpj} já cadastrado.`,
        );
      }

      this.logger.error(
        `Erro ao criar producer: ${producer.cpfCnpj}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(): Promise<Producer[]> {
    this.logger.log('Buscando todos os producers com fazendas');

    try {
      const list = await this.prisma.producer.findMany({
        include: { farms: true },
      });

      this.logger.log(`Foram encontrados ${list.length} producers`);

      return list.map((p) => this.toProducerDomain(p, true));
    } catch (error) {
      this.logger.error('Erro ao buscar producers', error.stack);
      throw new BadRequestException(error.message || 'Erro desconhecido');
    }
  }

  async update(id: string, data: { name: string }): Promise<Producer> {
    this.logger.log(`Atualizando producer id=${id}`);

    try {
      const updated = await this.prisma.producer.update({
        where: { id },
        data: {
          name: data.name,
          // document should NOT be updated here
        },
      });

      this.logger.log(`Producer atualizado com sucesso: ${updated.id}`);
      return this.toProducerDomain(updated, false);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Producer com id ${id} não encontrado para atualização.`);
        throw new NotFoundException(`Producer com id ${id} não encontrado.`);
      }
      this.logger.error(`Erro ao atualizar producer id=${id}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deletando producer id=${id}`);

    try {
      await this.prisma.producer.delete({ where: { id } });
      this.logger.log(`Producer id=${id} deletado com sucesso`);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Producer com id ${id} não encontrado para deleção.`);
        throw new NotFoundException(`Producer com id ${id} não encontrado.`);
      }
      this.logger.error(`Erro ao deletar producer id=${id}`, error.stack);
      throw error;
    }
  }
}
