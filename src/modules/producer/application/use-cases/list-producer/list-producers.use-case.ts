import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { Producer } from '@/producer/domain/entities/producer.entitry';

@Injectable()
export class ListProducersUseCase {
  private readonly logger = new Logger(ListProducersUseCase.name);

  constructor(
    @Inject('IProducerRepository')
    private readonly repository: IProducerRepository,
  ) {}

  async execute(): Promise<Producer[]> {
    this.logger.log('Listando todos os produtores');

    try {
      const producers = await this.repository.findAll();
      this.logger.log(`Foram encontrados ${producers.length} produtores`);
      return producers;
    } catch (error) {
      this.logger.error('Erro ao listar produtores', error.stack);
      throw new InternalServerErrorException('Erro ao buscar produtores');
    }
  }
}
