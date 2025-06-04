import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateProducerDTO {
  @ApiProperty({
    description: 'Nome do produtor',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do produtor (somente números)',
    example: '12345678901',
  })
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'O documento deve conter 11 (CPF) ou 14 (CNPJ) dígitos numéricos.',
  })
  document: string;
}
