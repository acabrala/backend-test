// src/modules/producer/presentation/dto/producer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { FarmDto } from '@/farm/presentation/dto/farm.dto';

export class ProducerDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ name: '_document' })
  _document: string;

  @ApiProperty({ name: '_name' })
  _name: string;

  @ApiProperty({ type: [FarmDto] })
  _farms: FarmDto[];
}
