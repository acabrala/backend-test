import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { FarmController } from '@/farm/presentation/controllers/farm.controller';
import { CreateFarmUseCase } from '@/farm/application/use-cases/create-farm/create-farm.usecase';
import { UpdateFarmUseCase } from '@/farm/application/use-cases/update-farm/update-farm.usecase';
import { DeleteFarmUseCase } from '@/farm/application/use-cases/delete-farm/delete-farm.usecase';
import { PrismaFarmRepository } from '@/farm/infrastructure/repositories/prisma-farm.repository';
import { ListFarmsByProducerUseCase } from './application/use-cases/list-farm-by-producer/list-farms-by-producer.usecase';

@Module({
  controllers: [FarmController],
  providers: [
    PrismaClient,
    {
      provide: 'IFarmRepository',
      useClass: PrismaFarmRepository,
    },
    CreateFarmUseCase,
    UpdateFarmUseCase,
    DeleteFarmUseCase,
    ListFarmsByProducerUseCase,
  ],
  exports: [
    CreateFarmUseCase,
    UpdateFarmUseCase,
    DeleteFarmUseCase,
    ListFarmsByProducerUseCase,
    'IFarmRepository',
  ],
})
export class FarmModule {}
