import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { ICpfCnpjValidator } from '@/producer/domain/validators/cpf-cnpj-validator.interface';
import { Producer } from '@/producer/domain/entities/producer.entitry';

@Injectable()
export class UpdateProducerUseCase {
  private readonly logger = new Logger(UpdateProducerUseCase.name);

  constructor(
    @Inject('IProducerRepository')
    private readonly producerRepo: IProducerRepository,
    @Inject('ICpfCnpjValidator')
    private readonly cpfCnpjValidator: ICpfCnpjValidator,
  ) {}

  async execute(
    id: string,
    data: { name: string; document: string; farms?: any[] },
  ): Promise<Producer> {
    this.logger.log(`Iniciando atualização do produtor com ID: ${id}`);

    if (!this.cpfCnpjValidator.isValid(data.document)) {
      this.logger.warn(`Documento inválido fornecido: ${data.document}`);
      throw new BadRequestException('CPF ou CNPJ inválido');
    }

    const producer = new Producer(
      data.document,
      data.name,
      data.farms ?? [],
      id,
    );

    try {
      const updated = await this.producerRepo.update(id, producer);
      this.logger.log(`Produtor com ID ${id} atualizado com sucesso`);
      return updated;
    } catch (error) {
      this.logger.error(`Erro ao atualizar produtor com ID ${id}`, error.stack);
      throw new InternalServerErrorException('Erro ao atualizar produtor');
    }
  }
}
