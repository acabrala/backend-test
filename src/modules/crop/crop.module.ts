import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CropController } from '@/crop/presentation/controllers/crop.controller';
import { AddCropUseCase } from '@/crop/application/use-cases/create-crop/create-crop.usecase';

import { PrismaCropRepository } from './infrastructure/repositories/crop/prisma-crop.repository';
import { FarmModule } from '@/farm/farm.module';

@Module({
  imports: [FarmModule],
  controllers: [CropController],
  providers: [
    PrismaClient,
    AddCropUseCase,
    {
      provide: 'ICropRepository',
      useClass: PrismaCropRepository,
    },
  ],
  exports: ['ICropRepository', AddCropUseCase],
})
export class CropModule {}
