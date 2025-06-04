import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { Producer } from '@/producer/domain/entities/producer.entitry';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaProducerRepository implements IProducerRepository {
  private readonly logger = new Logger(PrismaProducerRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByDocument(document: string): Promise<Producer | null> {
    this.logger.log(`Buscando producer pelo documento: ${document}`);

    try {
      const data = await this.prisma.producer.findUnique({
        where: { document },
      });
      if (!data) {
        this.logger.warn(`Producer não encontrado para documento: ${document}`);
        return null;
      }

      this.logger.log(`Producer encontrado: ${data.id}`);
      return new Producer(data.document, data.name, [], data.id);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar producer pelo documento: ${document}`,
        error.stack,
      );
      throw error;
    }
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

      return new Producer(created.document, created.name, [], created.id);
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

      return list.map((p) => {
        const farms = p.farms.map(
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

        return new Producer(p.document, p.name, farms, p.id);
      });
    } catch (error) {
      this.logger.error('Erro ao buscar producers', error.stack);
      throw new BadRequestException(error.message || 'Erro desconhecido');
    }
  }

  async update(id: string, producer: Producer): Promise<Producer> {
    this.logger.log(`Atualizando producer id=${id}`);

    try {
      const updated = await this.prisma.producer.update({
        where: { id },
        data: {
          name: producer.name,
          document: producer.cpfCnpj,
        },
      });

      this.logger.log(`Producer atualizado com sucesso: ${updated.id}`);
      return new Producer(updated.document, updated.name, [], updated.id);
    } catch (error) {
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
      this.logger.error(`Erro ao deletar producer id=${id}`, error.stack);
      throw error;
    }
  }
}
