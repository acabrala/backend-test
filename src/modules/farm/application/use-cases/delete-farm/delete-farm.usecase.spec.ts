import { DeleteFarmUseCase } from './delete-farm.usecase';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';

describe('DeleteFarmUseCase', () => {
  let useCase: DeleteFarmUseCase;
  let farmRepo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    farmRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new DeleteFarmUseCase(farmRepo);
  });

  it('deve deletar a fazenda quando existir', async () => {
    const fakeFarm = new Farm(
      'farm-123',
      'Fazenda Teste',
      'Cidade',
      'Estado',
      100,
      50,
      50,
      'prod-123',
      [],
    );

    farmRepo.findById.mockResolvedValue(fakeFarm);
    farmRepo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('farm-123')).resolves.toBeUndefined();

    expect(farmRepo.findById).toHaveBeenCalledWith('farm-123');
    expect(farmRepo.delete).toHaveBeenCalledWith('farm-123');
  });

  it('deve lançar erro se a fazenda não existir', async () => {
    farmRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('farm-999')).rejects.toThrowError(
      'Fazenda não encontrada.',
    );

    expect(farmRepo.findById).toHaveBeenCalledWith('farm-999');
    expect(farmRepo.delete).not.toHaveBeenCalled();
  });

  it('deve propagar erro do repositório no delete', async () => {
    const fakeFarm = new Farm(
      'farm-124',
      'Outra Fazenda',
      'Cidade',
      'Estado',
      100,
      50,
      50,
      'prod-124',
      [],
    );

    farmRepo.findById.mockResolvedValue(fakeFarm);
    const error = new Error('Erro ao deletar');
    farmRepo.delete.mockRejectedValue(error);

    await expect(useCase.execute('farm-124')).rejects.toThrow(error);

    expect(farmRepo.findById).toHaveBeenCalledWith('farm-124');
    expect(farmRepo.delete).toHaveBeenCalledWith('farm-124');
  });
});
