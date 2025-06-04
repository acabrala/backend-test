import { CreateFarmUseCase } from './create-farm.usecase';
import { IFarmRepository } from '@/farm/domain/repositories/farm.repository.interface';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { BadRequestException } from '@nestjs/common';

describe('CreateFarmUseCase', () => {
  let useCase: CreateFarmUseCase;
  let farmRepo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    farmRepo = {
      create: jest.fn(),
    } as any;

    useCase = new CreateFarmUseCase(farmRepo);
  });

  it('deve criar fazenda com dados válidos', async () => {
    const dto = {
      name: 'Fazenda X',
      city: 'São Paulo',
      state: 'SP',
      totalArea: 100,
      cultivableArea: 60,
      vegetationArea: 40,
      producerId: 'prod-123',
    };

    const farmCreated = new Farm(
      'farm-001',
      dto.name,
      dto.city,
      dto.state,
      dto.totalArea,
      dto.cultivableArea,
      dto.vegetationArea,
      dto.producerId,
      [],
    );

    farmRepo.create.mockResolvedValue(farmCreated);

    const result = await useCase.execute(dto);

    expect(farmRepo.create).toHaveBeenCalledTimes(1);
    expect(farmRepo.create).toHaveBeenCalledWith(expect.any(Farm));
    expect(result).toEqual(farmCreated);
  });

  it('deve lançar BadRequestException se totalArea for menor ou igual a zero', async () => {
    const dto = {
      name: 'Fazenda Y',
      city: 'Curitiba',
      state: 'PR',
      totalArea: 0,
      cultivableArea: 10,
      vegetationArea: 10,
      producerId: 'prod-456',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(farmRepo.create).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se cultivableArea for negativo', async () => {
    const dto = {
      name: 'Fazenda Z',
      city: 'Porto Alegre',
      state: 'RS',
      totalArea: 100,
      cultivableArea: -5,
      vegetationArea: 10,
      producerId: 'prod-789',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(farmRepo.create).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se vegetationArea for negativo', async () => {
    const dto = {
      name: 'Fazenda W',
      city: 'Florianópolis',
      state: 'SC',
      totalArea: 100,
      cultivableArea: 50,
      vegetationArea: -1,
      producerId: 'prod-987',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(farmRepo.create).not.toHaveBeenCalled();
  });

  it('deve relançar erro se farmRepo.create falhar', async () => {
    const dto = {
      name: 'Fazenda Q',
      city: 'Belo Horizonte',
      state: 'MG',
      totalArea: 100,
      cultivableArea: 60,
      vegetationArea: 40,
      producerId: 'prod-654',
    };

    const error = new Error('Erro inesperado');
    farmRepo.create.mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toThrow(error);
    expect(farmRepo.create).toHaveBeenCalled();
  });
});
