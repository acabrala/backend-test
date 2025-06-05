// src/modules/farm/presentation/dto/farm.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CropDto } from '@/crop/presentation/dto/crop.dto';

export class FarmDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  totalArea: number;

  @ApiProperty()
  cultivableArea: number;

  @ApiProperty()
  vegetationArea: number;

  @ApiProperty()
  producerId: string;

  @ApiProperty({ type: [CropDto] })
  crops: CropDto[];
}
