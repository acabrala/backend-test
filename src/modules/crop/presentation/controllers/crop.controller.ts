import {
  Controller,
  Post,
  Body,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddCropUseCase } from '@/crop/application/use-cases/create-crop/create-crop.usecase';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AddCropDto } from '@/crop/presentation/dto/create-crop.dto';

@ApiTags('Crops')
@Controller('crops')
export class CropController {
  private readonly logger = new Logger(CropController.name);

  constructor(private readonly addCropUseCase: AddCropUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar uma nova safra (crop) a uma fazenda' })
  @ApiBody({ type: AddCropDto })
  @ApiResponse({ status: 201, description: 'Safra adicionada com sucesso' })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async addCrop(@Body() dto: AddCropDto) {
    try {
      this.logger.log(
        `Recebendo solicitação para adicionar safra à fazenda ${JSON.stringify(dto)}`,
      );

      await this.addCropUseCase.execute({
        farmId: dto.farmId,
        cropName: dto.cropName,
        cropArea: dto.cropArea,
        plantedAt: new Date(dto.plantedAt),
        harvestedAt: dto.harvestedAt ? new Date(dto.harvestedAt) : undefined,
      });

      return { message: 'Safra adicionada com sucesso' };
    } catch (error) {
      this.logger.error('Erro ao adicionar safra', error.stack);
      throw new InternalServerErrorException('Erro ao adicionar safra');
    }
  }
}
