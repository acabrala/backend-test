import { PrismaCropRepository } from './prisma-crop.repository';
import { PrismaClient } from '@prisma/client';
import { Crop } from '@/crop/domain/entities/crop.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('PrismaCropRepository', () => {
  const mockCrop = {
    create: jest.fn(),
    findMany: jest.fn(),
  };

  const mockPrisma = {
    crop: mockCrop,
  } as unknown as PrismaClient;

  let repository: PrismaCropRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PrismaCropRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a crop', async () => {
      const cropEntity = new Crop(
        'id-1',
        'farm-1',
        'milho',
        100,
        new Date('2023-01-01'),
        undefined,
      );

      const prismaReturn = {
        id: 'id-1',
        farmId: 'farm-1',
        name: 'milho',
        plantedArea: 100,
        plantedAt: new Date('2023-01-01'),
        harvestedAt: null,
        createdAt: new Date('2023-01-01'),
      };

      mockCrop.create.mockResolvedValue(prismaReturn);

      const result = await repository.create(cropEntity);

      expect(mockCrop.create).toHaveBeenCalledWith({
        data: {
          id: cropEntity.id,
          farmId: cropEntity.farmId,
          name: cropEntity.name,
          plantedArea: cropEntity.plantedArea,
          plantedAt: cropEntity.plantedAt,
          harvestedAt: null,
        },
      });

      expect(result).toBeInstanceOf(Crop);
      expect(result.harvestedAt).toBeUndefined();
    });

    it('should throw InternalServerErrorException on error', async () => {
      const cropEntity = new Crop(
        'id-2',
        'farm-2',
        'soja',
        200,
        new Date('2023-02-01'),
        undefined,
      );

      mockCrop.create.mockRejectedValue(new Error('DB error'));

      await expect(repository.create(cropEntity)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of crops', async () => {
      const prismaReturn = [
        {
          id: 'id-1',
          farmId: 'farm-1',
          name: 'milho',
          plantedArea: 100,
          plantedAt: new Date('2023-01-01'),
          harvestedAt: null,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'id-2',
          farmId: 'farm-2',
          name: 'soja',
          plantedArea: 200,
          plantedAt: new Date('2023-02-01'),
          harvestedAt: new Date('2023-05-01'),
          createdAt: new Date('2023-02-01'),
        },
      ];

      mockCrop.findMany.mockResolvedValue(prismaReturn);

      const results = await repository.findAll();

      expect(mockCrop.findMany).toHaveBeenCalled();
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(Crop);
      expect(results[1].harvestedAt).toEqual(new Date('2023-05-01'));
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockCrop.findMany.mockRejectedValue(new Error('DB error'));

      await expect(repository.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
