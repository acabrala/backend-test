import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Producer } from '@/producer/domain/entities/producer.entitry';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { ICpfCnpjValidator } from '@/producer/domain/validators/cpf-cnpj-validator.interface';

interface CreateProducerDto {
  document: string;
  name: string;
  farms?: any[];
}

@Injectable()
export class CreateProducerUseCase {
  private readonly logger = new Logger(CreateProducerUseCase.name);

  constructor(
    @Inject('IProducerRepository')
    private readonly producerRepo: IProducerRepository,

    @Inject('ICpfCnpjValidator')
    private readonly cpfCnpjValidator: ICpfCnpjValidator,
  ) {}

  async execute(dto: CreateProducerDto): Promise<Producer> {
    this.logger.log(
      `Iniciando criação de produtor com documento: ${dto.document}`,
    );

    if (!this.cpfCnpjValidator.isValid(dto.document)) {
      this.logger.warn(`Documento inválido: ${dto.document}`);

      throw new BadRequestException('CPF ou CNPJ inválido');
    }

    const producer = new Producer(dto.document, dto.name, dto.farms ?? []);

    try {
      await this.producerRepo.create(producer);

      this.logger.log(`Produtor criado com sucesso: ${producer.name}`);

      return producer;
    } catch (error) {
      this.logger.error(
        `Erro ao criar produtor: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao criar produtor');
    }
  }
}
