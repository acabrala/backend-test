import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsNumber,
  IsISO8601,
  IsOptional,
  Min,
} from 'class-validator';

export class AddCropDto {
  @ApiProperty({
    description: 'ID da fazenda associada',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsUUID()
  farmId: string;

  @ApiProperty({
    description: 'Nome da safra',
    example: 'Milho',
  })
  @IsString()
  cropName: string;

  @ApiProperty({
    description: 'Área plantada em hectares',
    example: 12.5,
  })
  @IsNumber()
  @Min(0.1)
  cropArea: number;

  @ApiProperty({
    description: 'Data do plantio (ISO string)',
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsISO8601()
  plantedAt: string;

  @ApiPropertyOptional({
    description: 'Data da colheita (opcional, ISO string)',
    example: '2025-10-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  harvestedAt?: string;
}
