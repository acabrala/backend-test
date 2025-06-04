import { ApiProperty } from '@nestjs/swagger';

export class UpdateFarmDto {
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
}
