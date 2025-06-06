import { Test, TestingModule } from '@nestjs/testing';
import { PrismaProducerRepository } from './prisma-producer.repository';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Producer } from '@/producer/domain/entities/producer.entity';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Mock data
const mockPrismaProducerData = {
  id: 'producer-id-1',
  document: '12345678901',
  name: 'Test Producer',
  farms: [
    {
      id: 'farm-id-1',
      name: 'Test Farm 1',
      city: 'Test City',
      state: 'TS',
      totalArea: 100,
      cultivableArea: 50,
      vegetationArea: 20,
      producerId: 'producer-id-1',
      // Prisma Farm objects might have more fields not directly used by Farm entity
    },
  ],
};

const mockExpectedFarmEntity = new Farm(
  mockPrismaProducerData.farms[0].id,
  mockPrismaProducerData.farms[0].name,
  mockPrismaProducerData.farms[0].city,
  mockPrismaProducerData.farms[0].state,
  mockPrismaProducerData.farms[0].totalArea,
  mockPrismaProducerData.farms[0].cultivableArea,
  mockPrismaProducerData.farms[0].vegetationArea,
  mockPrismaProducerData.farms[0].producerId,
  [], // Crops initialized as empty
);

const mockExpectedProducerEntityWithFarms = new Producer(
  mockPrismaProducerData.document,
  mockPrismaProducerData.name,
  [mockExpectedFarmEntity],
  mockPrismaProducerData.id,
);

const mockExpectedProducerEntityNoFarms = new Producer(
  mockPrismaProducerData.document,
  mockPrismaProducerData.name,
  [],
  mockPrismaProducerData.id,
);

describe('PrismaProducerRepository', () => {
  let repository: PrismaProducerRepository;
  let prismaServiceMock: {
    producer: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaServiceMock = {
      producer: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProducerRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaProducerRepository>(PrismaProducerRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should call prisma.producer.findUnique with correct ID', async () => {
      prismaServiceMock.producer.findUnique.mockResolvedValue(mockPrismaProducerData);
      await repository.findById('producer-id-1');
      expect(prismaServiceMock.producer.findUnique).toHaveBeenCalledWith({
        where: { id: 'producer-id-1' },
      });
    });

    it('should return a mapped Producer domain entity (no farms) if Prisma returns data', async () => {
      prismaServiceMock.producer.findUnique.mockResolvedValue(mockPrismaProducerData);
      const result = await repository.findById('producer-id-1');
      expect(result).toEqual(mockExpectedProducerEntityNoFarms);
    });

    it('should return null if Prisma returns no data', async () => {
      prismaServiceMock.producer.findUnique.mockResolvedValue(null);
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = { name: 'Updated Producer Name' };
    const prismaProducerAfterUpdate = { ...mockPrismaProducerData, name: updateData.name, farms: undefined }; // update doesn't involve farms in its direct return mapping
    const expectedProducerEntityAfterUpdate = new Producer(
      prismaProducerAfterUpdate.document,
      prismaProducerAfterUpdate.name,
      [], // No farms expected from update mapping
      prismaProducerAfterUpdate.id,
    );

    it('should call prisma.producer.update with correct ID and data', async () => {
      prismaServiceMock.producer.update.mockResolvedValue(prismaProducerAfterUpdate);
      await repository.update('producer-id-1', updateData);
      expect(prismaServiceMock.producer.update).toHaveBeenCalledWith({
        where: { id: 'producer-id-1' },
        data: { name: updateData.name },
      });
    });

    it('should return a mapped Producer domain entity (no farms) on successful update', async () => {
      prismaServiceMock.producer.update.mockResolvedValue(prismaProducerAfterUpdate);
      const result = await repository.update('producer-id-1', updateData);
      expect(result).toEqual(expectedProducerEntityAfterUpdate);
    });

    it('should throw NotFoundException if prisma.producer.update throws P2025 error', async () => {
      const error = new PrismaClientKnownRequestError('Record to update not found.', {
        code: 'P2025',
        clientVersion: 'testVersion',
      });
      prismaServiceMock.producer.update.mockRejectedValue(error);
      await expect(repository.update('non-existent-id', updateData)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw other errors from prisma.producer.update', async () => {
      const error = new Error('Some other database error');
      prismaServiceMock.producer.update.mockRejectedValue(error);
      await expect(repository.update('producer-id-1', updateData)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should call prisma.producer.findMany with include: { farms: true }', async () => {
      prismaServiceMock.producer.findMany.mockResolvedValue([mockPrismaProducerData]);
      await repository.findAll();
      expect(prismaServiceMock.producer.findMany).toHaveBeenCalledWith({
        include: { farms: true },
      });
    });

    it('should return an array of mapped Producer domain entities, including mapped Farm entities', async () => {
      prismaServiceMock.producer.findMany.mockResolvedValue([mockPrismaProducerData]);
      const result = await repository.findAll();
      expect(result).toEqual([mockExpectedProducerEntityWithFarms]);
    });
     it('should return an empty array if no producers are found', async () => {
      prismaServiceMock.producer.findMany.mockResolvedValue([]);
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByDocument', () => {
    it('should call prisma.producer.findUnique with correct document', async () => {
      prismaServiceMock.producer.findUnique.mockResolvedValue(mockPrismaProducerData);
      await repository.findByDocument(mockPrismaProducerData.document);
      expect(prismaServiceMock.producer.findUnique).toHaveBeenCalledWith({
        where: { document: mockPrismaProducerData.document },
      });
    });

    it('should return a mapped Producer domain entity (no farms) if Prisma returns data', async () => {
      prismaServiceMock.producer.findUnique.mockResolvedValue(mockPrismaProducerData);
      const result = await repository.findByDocument(mockPrismaProducerData.document);
      expect(result).toEqual(mockExpectedProducerEntityNoFarms);
    });

    it('should return null if Prisma returns no data', async () => {
      prismaServiceMock.producer.findUnique.mockResolvedValue(null);
      const result = await repository.findByDocument('non-existent-document');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const inputProducerEntity = new Producer('new-doc-123', 'New Producer', []); // ID is undefined before creation
    const prismaProducerAfterCreation = {
      id: 'newly-created-id',
      document: inputProducerEntity.cpfCnpj,
      name: inputProducerEntity.name,
      // farms are not part of create data or immediate response mapping here
    };
    const expectedProducerEntityAfterCreation = new Producer(
      prismaProducerAfterCreation.document,
      prismaProducerAfterCreation.name,
      [],
      prismaProducerAfterCreation.id,
    );

    it('should call prisma.producer.create with correct data', async () => {
      prismaServiceMock.producer.create.mockResolvedValue(prismaProducerAfterCreation);
      await repository.create(inputProducerEntity);
      expect(prismaServiceMock.producer.create).toHaveBeenCalledWith({
        data: {
          name: inputProducerEntity.name,
          document: inputProducerEntity.cpfCnpj,
        },
      });
    });

    it('should return a mapped Producer domain entity (no farms) on successful creation', async () => {
      prismaServiceMock.producer.create.mockResolvedValue(prismaProducerAfterCreation);
      const result = await repository.create(inputProducerEntity);
      expect(result).toEqual(expectedProducerEntityAfterCreation);
    });

    it('should throw ConflictException if prisma.producer.create throws P2002 error', async () => {
      const error = new PrismaClientKnownRequestError('Unique constraint failed.', {
        code: 'P2002',
        clientVersion: 'testVersion',
        meta: { target: ['document'] }, // Example meta, adjust if needed
      });
      prismaServiceMock.producer.create.mockRejectedValue(error);
      await expect(repository.create(inputProducerEntity)).rejects.toThrow(ConflictException);
    });

    it('should re-throw other errors from prisma.producer.create', async () => {
      const error = new Error('Some other database error');
      prismaServiceMock.producer.create.mockRejectedValue(error);
      await expect(repository.create(inputProducerEntity)).rejects.toThrow(error);
    });
  });
});
