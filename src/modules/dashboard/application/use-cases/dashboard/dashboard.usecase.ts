import { Injectable, Inject } from '@nestjs/common';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { ICropRepository } from '@/crop/domain/repositories/crop.repository.interface';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(
    @Inject('IFarmRepository')
    private readonly farmRepo: IFarmRepository,
    @Inject('ICropRepository')
    private readonly cropRepo: ICropRepository,
  ) {}

  async execute() {
    const farms = await this.farmRepo.findAll();
    const crops = await this.cropRepo.findAll();

    const totalFarms = farms.length;
    const totalArea = farms.reduce(
      (acc, farm) =>
        acc + (typeof farm.totalArea === 'number' ? farm.totalArea : 0),
      0,
    );

    const byState: Record<string, number> = {};
    const landUse = { agricultural: 0, vegetation: 0 };

    for (const farm of farms) {
      byState[farm.state] = (byState[farm.state] ?? 0) + 1;
      landUse.agricultural +=
        typeof farm.totalArea === 'number' ? farm.totalArea : 0;
      landUse.vegetation +=
        typeof farm.vegetationArea === 'number' ? farm.vegetationArea : 0;
    }

    const byCrop: Record<string, number> = {};
    for (const crop of crops) {
      byCrop[crop.name] = (byCrop[crop.name] ?? 0) + 1;
    }

    return {
      totalFarms,
      totalArea,
      byState,
      byCrop,
      landUse,
    };
  }
}
