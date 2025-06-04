import { AddCropUseCase } from './create-crop.usecase';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { ICropRepository } from '@/crop/domain/repositories/crop.repository.interface';
import { Crop } from '@/crop/domain/entities/crop.entity';
import { NotFoundException } from '@nestjs/common';
import { Farm } from '@/farm/domain/entities/farm.entity';

describe('AddCropUseCase', () => {
  let useCase: AddCropUseCase;
  let farmRepo: jest.Mocked<IFarmRepository>;
  let cropRepo: jest.Mocked<ICropRepository>;

  const mockFarm: Farm = new Farm(
    'farm-123',
    'Fazenda Teste',
    'Cidade',
    'SP',
    100,
    80,
    20,
    'producer-abc',
    [],
  );

  beforeEach(() => {
    farmRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    cropRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new AddCropUseCase(farmRepo, cropRepo);
  });

  it('deve adicionar uma nova safra com sucesso', async () => {
    farmRepo.findById.mockResolvedValue(mockFarm);
    cropRepo.create.mockResolvedValue(
      new Crop(
        'crop-1',
        mockFarm.id,
        'Milho',
        50,
        new Date('2025-06-01'),
        new Date('2025-10-01'),
      ),
    );

    await expect(
      useCase.execute({
        farmId: mockFarm.id,
        cropName: 'Milho',
        cropArea: 50,
        plantedAt: new Date('2025-06-01'),
        harvestedAt: new Date('2025-10-01'),
      }),
    ).resolves.toBeUndefined();

    expect(farmRepo.findById).toHaveBeenCalledWith(mockFarm.id);
    expect(cropRepo.create).toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se a fazenda não existir', async () => {
    farmRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        farmId: 'invalida',
        cropName: 'Soja',
        cropArea: 10,
        plantedAt: new Date(),
      }),
    ).rejects.toThrow(NotFoundException);

    expect(cropRepo.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro se falhar ao salvar a safra', async () => {
    farmRepo.findById.mockResolvedValue(mockFarm);
    cropRepo.create.mockRejectedValue(new Error('Erro de banco'));

    await expect(
      useCase.execute({
        farmId: mockFarm.id,
        cropName: 'Arroz',
        cropArea: 30,
        plantedAt: new Date(),
      }),
    ).rejects.toThrow('Erro ao adicionar safra');

    expect(cropRepo.create).toHaveBeenCalled();
  });
});
