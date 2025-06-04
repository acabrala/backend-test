import { UpdateFarmUseCase } from './update-farm.usecase';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';

describe('UpdateFarmUseCase', () => {
  let useCase: UpdateFarmUseCase;
  let farmRepo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    farmRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateFarmUseCase(farmRepo);
  });

  it('deve atualizar uma fazenda existente', async () => {
    const existingFarm = new Farm(
      'farm-1',
      'Fazenda Antiga',
      'Cidade A',
      'Estado A',
      100,
      50,
      50,
      'prod-1',
      [],
    );
    farmRepo.findById.mockResolvedValue(existingFarm);

    const dto = {
      name: 'Fazenda Nova',
      city: 'Cidade Nova',
      state: 'Estado Nova',
      totalArea: 150,
      cultivableArea: 70,
      vegetationArea: 80,
      producerId: 'prod-1',
    };

    const updatedFarm = new Farm(
      'farm-1',
      dto.name,
      dto.city,
      dto.state,
      dto.totalArea,
      dto.cultivableArea,
      dto.vegetationArea,
      dto.producerId,
      existingFarm.crops,
    );

    farmRepo.update.mockResolvedValue(updatedFarm);

    const result = await useCase.execute('farm-1', dto);

    expect(farmRepo.findById).toHaveBeenCalledWith('farm-1');
    expect(farmRepo.update).toHaveBeenCalledWith('farm-1', expect.any(Farm));
    expect(result).toEqual(updatedFarm);
  });

  it('deve lançar erro se a fazenda não for encontrada', async () => {
    farmRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('farm-inexistente', {
        name: 'Fazenda',
        city: 'Cidade',
        state: 'Estado',
        totalArea: 100,
        cultivableArea: 50,
        vegetationArea: 50,
        producerId: 'prod-1',
      }),
    ).rejects.toThrow('Fazenda não encontrada.');

    expect(farmRepo.findById).toHaveBeenCalledWith('farm-inexistente');
    expect(farmRepo.update).not.toHaveBeenCalled();
  });
});
