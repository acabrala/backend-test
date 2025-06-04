import { Test, TestingModule } from '@nestjs/testing';
import { CreateProducerUseCase } from './create-producer.usecase';
import { Producer } from '@/producer/domain/entities/producer.entitry';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('CreateProducerUseCase', () => {
  let useCase: CreateProducerUseCase;
  let producerRepoMock: { create: jest.Mock };
  let cpfCnpjValidatorMock: { isValid: jest.Mock };

  beforeEach(async () => {
    producerRepoMock = { create: jest.fn() };
    cpfCnpjValidatorMock = { isValid: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProducerUseCase,
        {
          provide: 'IProducerRepository',
          useValue: producerRepoMock,
        },
        {
          provide: 'ICpfCnpjValidator',
          useValue: cpfCnpjValidatorMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateProducerUseCase>(CreateProducerUseCase);
  });

  it('should create a producer successfully when CPF/CNPJ is valid', async () => {
    const dto = {
      document: '12345678901',
      name: 'Produtor Teste',
      farms: [],
    };

    cpfCnpjValidatorMock.isValid.mockReturnValue(true);
    producerRepoMock.create.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(cpfCnpjValidatorMock.isValid).toHaveBeenCalledWith(dto.document);
    expect(producerRepoMock.create).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Producer);
    expect(result.name).toBe(dto.name);
  });

  it('should throw BadRequestException when CPF/CNPJ is invalid', async () => {
    const dto = {
      document: 'invalid-document',
      name: 'Produtor Teste',
      farms: [],
    };

    cpfCnpjValidatorMock.isValid.mockReturnValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(producerRepoMock.create).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException when repo create fails', async () => {
    const dto = {
      document: '12345678901',
      name: 'Produtor Teste',
      farms: [],
    };

    cpfCnpjValidatorMock.isValid.mockReturnValue(true);
    producerRepoMock.create.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(producerRepoMock.create).toHaveBeenCalled();
  });
});
