import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateFarmDto } from '@/farm/presentation/dto/create-farm.dto';
import { UpdateFarmDto } from '@/farm/presentation/dto/update-farm.dto';

import { CreateFarmUseCase } from '@/farm/application/use-cases/create-farm/create-farm.usecase';
import { UpdateFarmUseCase } from '@/farm/application/use-cases/update-farm/update-farm.usecase';
import { DeleteFarmUseCase } from '@/farm/application/use-cases/delete-farm/delete-farm.usecase';
import { ListFarmsByProducerUseCase } from '@/farm/application/use-cases/list-farm-by-producer/list-farms-by-producer.usecase';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { FarmDto } from '../dto/farm.dto';

@ApiTags('Farms')
@Controller('farms')
export class FarmController {
  private readonly logger = new Logger(FarmController.name);

  constructor(
    private readonly createFarmUseCase: CreateFarmUseCase,
    private readonly updateFarmUseCase: UpdateFarmUseCase,
    private readonly deleteFarmUseCase: DeleteFarmUseCase,
    private readonly listFarmsByProducerUseCase: ListFarmsByProducerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova fazenda' })
  @ApiBody({ type: CreateFarmDto })
  @ApiResponse({ status: 201, description: 'Fazenda criada com sucesso' })
  async create(@Body() dto: CreateFarmDto) {
    this.logger.log('Criando nova fazenda');
    try {
      return await this.createFarmUseCase.execute(dto);
    } catch (error) {
      this.logger.error('Erro ao criar fazenda', error.stack);
      throw new InternalServerErrorException('Erro ao criar fazenda');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma fazenda existente' })
  @ApiParam({ name: 'id', description: 'ID da fazenda' })
  @ApiBody({ type: UpdateFarmDto })
  @ApiResponse({ status: 200, description: 'Fazenda atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() dto: UpdateFarmDto) {
    this.logger.log(`Atualizando fazenda: ${id}`);
    try {
      return await this.updateFarmUseCase.execute(id, dto);
    } catch (error) {
      this.logger.error(`Erro ao atualizar fazenda ${id}`, error.stack);
      throw new InternalServerErrorException('Erro ao atualizar fazenda');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma fazenda' })
  @ApiParam({ name: 'id', description: 'ID da fazenda' })
  @ApiResponse({ status: 200, description: 'Fazenda deletada com sucesso' })
  async delete(@Param('id') id: string) {
    this.logger.log(`Deletando fazenda: ${id}`);
    try {
      await this.deleteFarmUseCase.execute(id);
      return { message: 'Fazenda deletada com sucesso.' };
    } catch (error) {
      this.logger.error(`Erro ao deletar fazenda ${id}`, error.stack);
      throw new InternalServerErrorException('Erro ao deletar fazenda');
    }
  }

  @Get('producer/:producerId')
  @ApiOperation({ summary: 'Lista fazendas pelo ID do produtor' })
  @ApiParam({ name: 'producerId', description: 'ID do produtor' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fazendas do produtor',
    type: [FarmDto],
  })
  async getFarmsByProducer(
    @Param('producerId') producerId: string,
  ): Promise<Farm[]> {
    this.logger.log(`Listando fazendas do produtor: ${producerId}`);
    try {
      return await this.listFarmsByProducerUseCase.execute(producerId);
    } catch (error) {
      this.logger.error(
        `Erro ao listar fazendas do produtor ${producerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao listar fazendas do produtor',
      );
    }
  }
}
