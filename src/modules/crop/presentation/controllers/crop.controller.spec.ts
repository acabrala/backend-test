import { Test, TestingModule } from '@nestjs/testing';
import { CropController } from './crop.controller';
import { AddCropUseCase } from '@/crop/application/use-cases/create-crop/create-crop.usecase';
import { InternalServerErrorException } from '@nestjs/common';

describe('CropController', () => {
  let controller: CropController;
  let addCropUseCase: AddCropUseCase;

  const mockAddCropUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CropController],
      providers: [{ provide: AddCropUseCase, useValue: mockAddCropUseCase }],
    }).compile();

    controller = module.get<CropController>(CropController);
    addCropUseCase = module.get<AddCropUseCase>(AddCropUseCase);

    jest.clearAllMocks();
  });

  describe('addCrop', () => {
    it('deve adicionar safra com sucesso', async () => {
      const dto = {
        farmId: 'farm123',
        cropName: 'Milho',
        cropArea: 100,
        plantedAt: '2024-05-01T00:00:00Z',
        harvestedAt: '2024-10-01T00:00:00Z',
      };

      mockAddCropUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.addCrop(dto);

      expect(mockAddCropUseCase.execute).toHaveBeenCalledWith({
        farmId: dto.farmId,
        cropName: dto.cropName,
        cropArea: dto.cropArea,
        plantedAt: new Date(dto.plantedAt),
        harvestedAt: new Date(dto.harvestedAt),
      });

      expect(result).toEqual({ message: 'Safra adicionada com sucesso' });
    });

    it('deve adicionar safra com sucesso mesmo sem harvestedAt', async () => {
      const dto = {
        farmId: 'farm123',
        cropName: 'Soja',
        cropArea: 50,
        plantedAt: '2024-06-01T00:00:00Z',
        harvestedAt: undefined,
      };

      mockAddCropUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.addCrop(dto);

      expect(mockAddCropUseCase.execute).toHaveBeenCalledWith({
        farmId: dto.farmId,
        cropName: dto.cropName,
        cropArea: dto.cropArea,
        plantedAt: new Date(dto.plantedAt),
        harvestedAt: undefined,
      });

      expect(result).toEqual({ message: 'Safra adicionada com sucesso' });
    });

    it('deve lançar InternalServerErrorException em erro', async () => {
      const dto = {
        farmId: 'farm123',
        cropName: 'Milho',
        cropArea: 100,
        plantedAt: '2024-05-01T00:00:00Z',
        harvestedAt: '2024-10-01T00:00:00Z',
      };

      const error = new Error('Erro inesperado');
      mockAddCropUseCase.execute.mockRejectedValue(error);

      await expect(controller.addCrop(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
