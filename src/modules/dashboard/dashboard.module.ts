import { Module } from '@nestjs/common';
import { DashboardController } from '@/dashboard/presentation/controller/dashboard.controller';
import { GetDashboardMetricsUseCase } from '@/dashboard/application/use-cases/dashboard/dashboard.usecase';

import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { FarmModule } from '@/farm/farm.module';
import { CropModule } from '@/crop/crop.module';

@Module({
  imports: [PrismaModule, FarmModule, CropModule],
  controllers: [DashboardController],
  providers: [PrismaService, GetDashboardMetricsUseCase],
})
export class DashboardModule {}
