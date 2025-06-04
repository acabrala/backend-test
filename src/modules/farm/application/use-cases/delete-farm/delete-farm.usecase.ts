import { Injectable, Inject } from '@nestjs/common';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';

@Injectable()
export class DeleteFarmUseCase {
  constructor(
    @Inject('IFarmRepository')
    private readonly farmRepo: IFarmRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const farm = await this.farmRepo.findById(id);
    if (!farm) {
      throw new Error('Fazenda não encontrada.');
    }

    await this.farmRepo.delete(id);
  }
}
