import { Injectable, Inject, Logger } from '@nestjs/common';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';

@Injectable()
export class DeleteProducerUseCase {
  private readonly logger = new Logger(DeleteProducerUseCase.name);

  constructor(
    @Inject('IProducerRepository')
    private readonly producerRepo: IProducerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`Iniciando exclusão do produtor com id: ${id}`);

    try {
      await this.producerRepo.delete(id);
      this.logger.log(`Produtor com id ${id} excluído com sucesso.`);
    } catch (error) {
      this.logger.error(
        `Erro ao excluir produtor com id ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
