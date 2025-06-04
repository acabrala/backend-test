import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProducerModule } from './modules/producer/farms.module';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';
import { FarmModule } from '@/farm/farm.module';
import { CropModule } from '@/crop/crop.module';
import { DashboardModule } from '@/dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    ProducerModule,
    FarmModule,
    DashboardModule,
    CropModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
