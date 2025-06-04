import { Injectable, Inject } from '@nestjs/common';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';

interface UpdateFarmDto {
  name: string;
  city: string;
  state: string;
  totalArea: number;
  cultivableArea: number;
  vegetationArea: number;
  producerId: string;
}

@Injectable()
export class UpdateFarmUseCase {
  constructor(
    @Inject('IFarmRepository')
    private readonly farmRepo: IFarmRepository,
  ) {}

  async execute(id: string, dto: UpdateFarmDto): Promise<Farm> {
    const existingFarm = await this.farmRepo.findById(id);
    if (!existingFarm) {
      throw new Error('Fazenda não encontrada.');
    }

    const farmToUpdate = new Farm(
      id,
      dto.name,
      dto.city,
      dto.state,
      dto.totalArea,
      dto.cultivableArea,
      dto.vegetationArea,
      dto.producerId,
      existingFarm.crops,
    );

    return this.farmRepo.update(id, farmToUpdate);
  }
}
