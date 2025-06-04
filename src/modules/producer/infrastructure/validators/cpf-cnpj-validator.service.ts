import { cpf, cnpj } from 'cpf-cnpj-validator';
import { ICpfCnpjValidator } from '@/producer/domain/validators/cpf-cnpj-validator.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CpfCnpjValidator implements ICpfCnpjValidator {
  isValid(value: string): boolean {
    const clean = value.replace(/\D/g, '');
    return cpf.isValid(clean) || cnpj.isValid(clean);
  }
}
