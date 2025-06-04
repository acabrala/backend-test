import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProducerUseCase } from './update-producer.usecase';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { ICpfCnpjValidator } from '@/producer/domain/validators/cpf-cnpj-validator.interface';
import { Producer } from '@/producer/domain/entities/producer.entitry';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UpdateProducerUseCase', () => {
  let useCase: UpdateProducerUseCase;
  let producerRepoMock: { update: jest.Mock };
  let validatorMock: { isValid: jest.Mock };

  beforeEach(async () => {
    producerRepoMock = { update: jest.fn() };
    validatorMock = { isValid: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProducerUseCase,
        {
          provide: 'IProducerRepository',
          useValue: producerRepoMock,
        },
        {
          provide: 'ICpfCnpjValidator',
          useValue: validatorMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProducerUseCase>(UpdateProducerUseCase);
  });

  it('should update producer successfully', async () => {
    const id = '123';
    const data = {
      name: 'Produtor Atualizado',
      document: '12345678901',
      farms: [],
    };
    const updatedProducer = new Producer(
      data.document,
      data.name,
      data.farms,
      id,
    );

    validatorMock.isValid.mockReturnValue(true);
    producerRepoMock.update.mockResolvedValue(updatedProducer);

    const result = await useCase.execute(id, data);

    expect(validatorMock.isValid).toHaveBeenCalledWith(data.document);
    expect(producerRepoMock.update).toHaveBeenCalledWith(
      id,
      expect.any(Producer),
    );
    expect(result).toEqual(updatedProducer);
  });

  it('should throw BadRequestException if document is invalid', async () => {
    const id = '123';
    const data = {
      name: 'Produtor',
      document: 'invalid',
    };

    validatorMock.isValid.mockReturnValue(false);

    await expect(useCase.execute(id, data)).rejects.toThrow(
      BadRequestException,
    );
    expect(validatorMock.isValid).toHaveBeenCalledWith(data.document);
    expect(producerRepoMock.update).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException if repository update fails', async () => {
    const id = '123';
    const data = {
      name: 'Produtor',
      document: '12345678901',
    };

    validatorMock.isValid.mockReturnValue(true);
    producerRepoMock.update.mockRejectedValue(new Error('DB failure'));

    await expect(useCase.execute(id, data)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(validatorMock.isValid).toHaveBeenCalledWith(data.document);
    expect(producerRepoMock.update).toHaveBeenCalledWith(
      id,
      expect.any(Producer),
    );
  });
});
