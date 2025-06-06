import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProducerDTO {
  @ApiPropertyOptional({
    description: 'Nome do produtor',
    example: 'João da Silva Atualizado',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;
}
