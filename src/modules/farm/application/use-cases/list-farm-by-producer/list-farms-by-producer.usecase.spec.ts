import { ListFarmsByProducerUseCase } from './list-farms-by-producer.usecase';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';

describe('ListFarmsByProducerUseCase', () => {
  let useCase: ListFarmsByProducerUseCase;
  let farmRepo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    farmRepo = {
      findByProducerId: jest.fn(),
    } as any;

    useCase = new ListFarmsByProducerUseCase(farmRepo);
  });

  it('deve retornar lista de fazendas para um producerId', async () => {
    const fakeFarms = [
      new Farm(
        'farm-1',
        'Fazenda 1',
        'Cidade A',
        'Estado A',
        100,
        50,
        50,
        'prod-1',
        [],
      ),
      new Farm(
        'farm-2',
        'Fazenda 2',
        'Cidade B',
        'Estado B',
        200,
        150,
        50,
        'prod-1',
        [],
      ),
    ];

    farmRepo.findByProducerId.mockResolvedValue(fakeFarms);

    const result = await useCase.execute('prod-1');

    expect(result).toEqual(fakeFarms);
    expect(farmRepo.findByProducerId).toHaveBeenCalledWith('prod-1');
  });

  it('deve lançar erro e logar se o repositório falhar', async () => {
    const error = new Error('Erro inesperado');
    farmRepo.findByProducerId.mockRejectedValue(error);

    await expect(useCase.execute('prod-2')).rejects.toThrow(error);

    expect(farmRepo.findByProducerId).toHaveBeenCalledWith('prod-2');
  });
});
