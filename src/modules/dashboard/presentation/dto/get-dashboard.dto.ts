import { ApiProperty } from '@nestjs/swagger';

class LandUseDto {
  @ApiProperty({ example: 15100, description: 'Área agrícola total' })
  agricultural: number;

  @ApiProperty({ example: 617, description: 'Área de vegetação total' })
  vegetation: number;
}

export class DashboardMetricsDto {
  @ApiProperty({ example: 4, description: 'Número total de fazendas' })
  totalFarms: number;

  @ApiProperty({ example: 15100, description: 'Área total em hectares' })
  totalArea: number;

  @ApiProperty({
    description: 'Quantidade de fazendas agrupadas por estado (UF)',
    example: { SP: 4 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  byState: Record<string, number>;

  @ApiProperty({
    description: 'Quantidade agrupada por tipo de safra',
    example: {},
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  byCrop: Record<string, number>;

  @ApiProperty({ type: LandUseDto, description: 'Uso da terra' })
  landUse: LandUseDto;
}
