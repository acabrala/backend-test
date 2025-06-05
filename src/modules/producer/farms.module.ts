import { Module } from '@nestjs/common';
import { ProducerController } from '@/producer/presentation/controllers/producer.controller';
import { PrismaProducerRepository } from '@/producer/infrastructure/repositories/producers/prisma-producer.repository';
import { CreateProducerUseCase } from '@/producer/application/use-cases/create-producer/create-producer.usecase';
import { CpfCnpjValidator } from '@/producer/infrastructure/validators/cpf-cnpj-validator.service';
import { ListProducersUseCase } from '@/producer/application/use-cases/list-producer/list-producers.use-case';

import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProducerUseCase } from '@/producer/application/use-cases/update-producer/update-producer.usecase';
import { DeleteProducerUseCase } from '@/producer/application/use-cases/delete-producer/delete-producer.usecase';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProducerController],
  providers: [
    PrismaService,
    {
      provide: 'ICpfCnpjValidator',
      useClass: CpfCnpjValidator,
    },
    {
      provide: 'IProducerRepository',
      useClass: PrismaProducerRepository,
    },
    CreateProducerUseCase,
    ListProducersUseCase,
    UpdateProducerUseCase,
    DeleteProducerUseCase,
  ],
})
export class ProducerModule {}
