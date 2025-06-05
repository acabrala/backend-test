import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateProducerUseCase } from '@/producer/application/use-cases/create-producer/create-producer.usecase';
import { ListProducersUseCase } from '@/producer/application/use-cases/list-producer/list-producers.use-case';
import { UpdateProducerUseCase } from '@/producer/application/use-cases/update-producer/update-producer.usecase';
import { DeleteProducerUseCase } from '@/producer/application/use-cases/delete-producer/delete-producer.usecase';
import { CreateProducerDTO } from '@/producer/presentation/dto/create.dto';
import { ProducerDto } from '../dto/get-producer.dto';

@ApiTags('Producers')
@Controller('producers')
export class ProducerController {
  constructor(
    private readonly createProducer: CreateProducerUseCase,
    private readonly listProducers: ListProducersUseCase,
    private readonly updateProducer: UpdateProducerUseCase,
    private readonly deleteProducer: DeleteProducerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo produtor' })
  @ApiBody({ type: CreateProducerDTO })
  @ApiResponse({ status: 201, description: 'Produtor criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async create(@Body() body: CreateProducerDTO) {
    try {
      const producer = await this.createProducer.execute(body);
      return {
        id: producer.id,
        name: producer.name,
        document: producer.cpfCnpj,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os produtores e suas fazendas' })
  @ApiOkResponse({ description: 'Lista de produtores', type: [ProducerDto] })
  async findAll() {
    try {
      return await this.listProducers.execute();
    } catch (error) {
      throw new BadRequestException(error.message || 'Erro desconhecido');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um produtor' })
  @ApiParam({ name: 'id', required: true })
  async update(@Param('id') id: string, @Body() body: CreateProducerDTO) {
    try {
      const producer = await this.updateProducer.execute(id, body);
      return {
        id: producer.id,
        name: producer.name,
        document: producer.cpfCnpj,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um produtor' })
  @ApiParam({ name: 'id', required: true })
  async delete(@Param('id') id: string) {
    try {
      await this.deleteProducer.execute(id);
      return { message: 'Produtor removido com sucesso' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
