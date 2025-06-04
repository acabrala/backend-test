import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateFarmDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNumber()
  totalArea: number;

  @ApiProperty()
  @IsNumber()
  cultivableArea: number;

  @ApiProperty()
  @IsNumber()
  vegetationArea: number;

  @ApiProperty()
  @IsUUID()
  producerId: string;
}
