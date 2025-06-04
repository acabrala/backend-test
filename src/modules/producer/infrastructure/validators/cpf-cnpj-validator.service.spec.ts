import { CpfCnpjValidator } from './cpf-cnpj-validator.service';

describe('CpfCnpjValidator', () => {
  let validator: CpfCnpjValidator;

  beforeEach(() => {
    validator = new CpfCnpjValidator();
  });

  it('should return true for valid CPF', () => {
    const validCpf = '111.444.777-35';
    expect(validator.isValid(validCpf)).toBe(true);
  });

  it('should return false for invalid CPF', () => {
    const invalidCpf = '123.456.789-00';
    expect(validator.isValid(invalidCpf)).toBe(false);
  });

  it('should return true for valid CNPJ', () => {
    const validCnpj = '04.252.011/0001-10';
    expect(validator.isValid(validCnpj)).toBe(true);
  });

  it('should return false for invalid CNPJ', () => {
    const invalidCnpj = '12.345.678/9012-34';
    expect(validator.isValid(invalidCnpj)).toBe(false);
  });

  it('should ignore non-digit characters and validate correctly', () => {
    const validCpf = '11144477735';
    const validCnpj = '04252011000110';
    expect(validator.isValid(validCpf)).toBe(true);
    expect(validator.isValid(validCnpj)).toBe(true);
  });

  it('should return false for empty or non-numeric strings', () => {
    expect(validator.isValid('')).toBe(false);
    expect(validator.isValid('abc.def.ghi-jk')).toBe(false);
  });
});
