// src/modules/farm/presentation/dto/crop.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CropDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  farmId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  plantedArea: number;

  @ApiProperty()
  plantedAt: Date;

  @ApiProperty()
  harvestedAt: Date;
}
