import { Injectable, Inject, Logger } from '@nestjs/common';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';

@Injectable()
export class ListFarmsByProducerUseCase {
  private readonly logger = new Logger(ListFarmsByProducerUseCase.name);

  constructor(
    @Inject('IFarmRepository')
    private readonly farmRepo: IFarmRepository,
  ) {}

  async execute(producerId: string): Promise<Farm[]> {
    this.logger.log(`Buscando fazendas para produtorId: ${producerId}`);

    try {
      const farms = await this.farmRepo.findByProducerId(producerId);
      this.logger.log(`Encontradas ${farms.length} fazendas`);
      return farms;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar fazendas para producerId ${producerId}`,
        error.stack,
      );
      throw error;
    }
  }
}
