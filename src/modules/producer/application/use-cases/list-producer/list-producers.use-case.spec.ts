import { Test, TestingModule } from '@nestjs/testing';
import { ListProducersUseCase } from './list-producers.use-case';
import { Producer } from '@/producer/domain/entities/producer.entitry';
import { InternalServerErrorException } from '@nestjs/common';

describe('ListProducersUseCase', () => {
  let useCase: ListProducersUseCase;
  let repositoryMock: { findAll: jest.Mock };

  beforeEach(async () => {
    repositoryMock = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProducersUseCase,
        {
          provide: 'IProducerRepository',
          useValue: repositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<ListProducersUseCase>(ListProducersUseCase);
  });

  it('should return a list of producers', async () => {
    const mockProducers: Producer[] = [
      new Producer('12345678901', 'Produtor 1'),
      new Producer('10987654321', 'Produtor 2'),
    ];

    repositoryMock.findAll.mockResolvedValue(mockProducers);

    const result = await useCase.execute();

    expect(result).toEqual(mockProducers);
    expect(repositoryMock.findAll).toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException when repository throws', async () => {
    repositoryMock.findAll.mockRejectedValue(new Error('DB failure'));

    await expect(useCase.execute()).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(repositoryMock.findAll).toHaveBeenCalled();
  });
});
