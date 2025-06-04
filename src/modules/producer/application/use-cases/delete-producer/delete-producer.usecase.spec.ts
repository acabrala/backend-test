import { Test, TestingModule } from '@nestjs/testing';
import { DeleteProducerUseCase } from './delete-producer.usecase';

describe('DeleteProducerUseCase', () => {
  let useCase: DeleteProducerUseCase;
  let producerRepoMock: { delete: jest.Mock };

  beforeEach(async () => {
    producerRepoMock = { delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProducerUseCase,
        {
          provide: 'IProducerRepository',
          useValue: producerRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<DeleteProducerUseCase>(DeleteProducerUseCase);
  });

  it('should delete producer successfully', async () => {
    const id = '123';

    producerRepoMock.delete.mockResolvedValue(undefined);

    await expect(useCase.execute(id)).resolves.toBeUndefined();

    expect(producerRepoMock.delete).toHaveBeenCalledWith(id);
  });

  it('should throw error when deletion fails', async () => {
    const id = '123';
    const error = new Error('Failed to delete');

    producerRepoMock.delete.mockRejectedValue(error);

    await expect(useCase.execute(id)).rejects.toThrow(error);
    expect(producerRepoMock.delete).toHaveBeenCalledWith(id);
  });
});
