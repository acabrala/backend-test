import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { Producer } from '@/producer/domain/entities/producer.entity';
import { UpdateProducerDTO } from '@/producer/presentation/dto/update-producer.dto';

@Injectable()
export class UpdateProducerUseCase {
  private readonly logger = new Logger(UpdateProducerUseCase.name);

  constructor(
    @Inject('IProducerRepository')
    private readonly producerRepo: IProducerRepository,
  ) {}

  async execute(id: string, data: UpdateProducerDTO): Promise<Producer> {
    this.logger.log(`Iniciando atualização do produtor com ID: ${id}`);

    if (data.name === undefined) {
      // No actual update data provided, fetch and return existing.
      const existingProducer = await this.producerRepo.findById(id);
      if (!existingProducer) {
        throw new NotFoundException(`Produtor com ID ${id} não encontrado.`);
      }
      this.logger.log(
        `Nenhum dado de nome fornecido para atualização do produtor com ID: ${id}. Retornando existente.`,
      );
      return existingProducer;
    }

    // Ensure producer exists before attempting update
    const existing = await this.producerRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(
        `Produtor com ID ${id} não encontrado para atualização.`,
      );
    }

    try {
      // Only pass name to the repository's update method
      const updatedProducer = await this.producerRepo.update(id, {
        name: data.name,
      });
      this.logger.log(`Produtor com ID ${id} atualizado com sucesso`);
      return updatedProducer;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar produtor com ID ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar produtor.');
    }
  }
}
