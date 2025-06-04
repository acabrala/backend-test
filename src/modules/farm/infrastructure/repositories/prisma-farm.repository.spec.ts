import { PrismaFarmRepository } from './prisma-farm.repository';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { Crop } from '@/crop/domain/entities/crop.entity';

describe('PrismaFarmRepository', () => {
  let repo: PrismaFarmRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      farm: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    repo = new PrismaFarmRepository(prismaMock);
  });

  describe('create', () => {
    it('deve criar uma fazenda e retornar entidade Farm', async () => {
      const farm = new Farm(
        '1',
        'Fazenda Teste',
        'Cidade',
        'Estado',
        100,
        60,
        40,
        'prod-1',
        [],
      );

      prismaMock.farm.create.mockResolvedValue({
        id: '1',
        name: 'Fazenda Teste',
        city: 'Cidade',
        state: 'Estado',
        totalArea: 100,
        cultivableArea: 60,
        vegetationArea: 40,
        producerId: 'prod-1',
      });

      const result = await repo.create(farm);

      expect(prismaMock.farm.create).toHaveBeenCalledWith({
        data: {
          id: '1',
          name: 'Fazenda Teste',
          city: 'Cidade',
          state: 'Estado',
          totalArea: 100,
          cultivableArea: 60,
          vegetationArea: 40,
          producerId: 'prod-1',
        },
      });

      expect(result).toBeInstanceOf(Farm);
      expect(result.name).toBe('Fazenda Teste');
    });
  });

  describe('update', () => {
    it('deve atualizar uma fazenda e retornar entidade Farm', async () => {
      const farmToUpdate = new Farm(
        '1',
        'Fazenda Atualizada',
        'Nova Cidade',
        'Novo Estado',
        150,
        90,
        60,
        'prod-1',
        [],
      );

      prismaMock.farm.update.mockResolvedValue({
        id: '1',
        name: 'Fazenda Atualizada',
        city: 'Nova Cidade',
        state: 'Novo Estado',
        totalArea: 150,
        cultivableArea: 90,
        vegetationArea: 60,
        producerId: 'prod-1',
      });

      const result = await repo.update('1', farmToUpdate);

      expect(prismaMock.farm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Fazenda Atualizada',
          city: 'Nova Cidade',
          state: 'Novo Estado',
          totalArea: 150,
          cultivableArea: 90,
          vegetationArea: 60,
        },
      });

      expect(result).toBeInstanceOf(Farm);
      expect(result.name).toBe('Fazenda Atualizada');
    });
  });

  describe('delete', () => {
    it('deve deletar uma fazenda', async () => {
      prismaMock.farm.delete.mockResolvedValue({});

      await expect(repo.delete('1')).resolves.toBeUndefined();

      expect(prismaMock.farm.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findById', () => {
    it('deve retornar uma fazenda quando encontrada', async () => {
      prismaMock.farm.findUnique.mockResolvedValue({
        id: '1',
        name: 'Fazenda Teste',
        city: 'Cidade',
        state: 'Estado',
        totalArea: 100,
        cultivableArea: 60,
        vegetationArea: 40,
        producerId: 'prod-1',
      });

      const result = await repo.findById('1');

      expect(prismaMock.farm.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBeInstanceOf(Farm);
      expect(result?.name).toBe('Fazenda Teste');
    });

    it('deve retornar null quando fazenda não encontrada', async () => {
      prismaMock.farm.findUnique.mockResolvedValue(null);

      const result = await repo.findById('non-existent-id');

      expect(prismaMock.farm.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByProducerId', () => {
    it('deve retornar lista de fazendas com culturas associadas', async () => {
      prismaMock.farm.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Fazenda 1',
          city: 'Cidade1',
          state: 'Estado1',
          totalArea: 100,
          cultivableArea: 50,
          vegetationArea: 50,
          producerId: 'prod-1',
          crops: [
            {
              id: 'crop-1',
              farmId: '1',
              name: 'Milho',
              plantedArea: 40,
              plantedAt: new Date('2024-01-01'),
              harvestedAt: null,
            },
          ],
        },
      ]);

      const result = await repo.findByProducerId('prod-1');

      expect(prismaMock.farm.findMany).toHaveBeenCalledWith({
        where: { producerId: 'prod-1' },
        include: { crops: true },
      });

      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(Farm);
      expect(result[0].crops.length).toBe(1);
      expect(result[0].crops[0]).toBeInstanceOf(Crop);
      expect(result[0].crops[0].name).toBe('Milho');
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as fazendas', async () => {
      prismaMock.farm.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Fazenda 1',
          city: 'Cidade1',
          state: 'Estado1',
          totalArea: 100,
          cultivableArea: 50,
          vegetationArea: 50,
          producerId: 'prod-1',
        },
        {
          id: '2',
          name: 'Fazenda 2',
          city: 'Cidade2',
          state: 'Estado2',
          totalArea: 200,
          cultivableArea: 150,
          vegetationArea: 50,
          producerId: 'prod-2',
        },
      ]);

      const result = await repo.findAll();

      expect(prismaMock.farm.findMany).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(Farm);
      expect(result[1]).toBeInstanceOf(Farm);
    });
  });
});
