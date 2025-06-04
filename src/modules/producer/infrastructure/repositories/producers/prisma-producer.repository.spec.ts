import { Test, TestingModule } from '@nestjs/testing';
import { PrismaProducerRepository } from './prisma-producer.repository';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Producer } from '@/producer/domain/entities/producer.entitry';
import { Farm } from '@/farm/domain/entities/farm.entity';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('PrismaProducerRepository', () => {
  let repository: PrismaProducerRepository;
  let prisma: PrismaService;

  const mockPrismaService = {
    producer: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProducerRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaProducerRepository>(PrismaProducerRepository);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findByDocument', () => {
    it('deve retornar producer quando encontrado', async () => {
      const fakeData = { id: '1', document: '123', name: 'Producer 1' };
      (prisma.producer.findUnique as jest.Mock).mockResolvedValue(fakeData);

      const result = await repository.findByDocument('123');

      expect(result).toBeInstanceOf(Producer);
      expect(result?.cpfCnpj).toBe('123');
      expect(prisma.producer.findUnique).toHaveBeenCalledWith({
        where: { document: '123' },
      });
    });

    it('deve retornar null quando não encontrado', async () => {
      (prisma.producer.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByDocument('123');

      expect(result).toBeNull();
    });

    it('deve lançar erro ao ocorrer exceção', async () => {
      (prisma.producer.findUnique as jest.Mock).mockRejectedValue(
        new Error('Falha'),
      );

      await expect(repository.findByDocument('123')).rejects.toThrow('Falha');
    });
  });

  describe('create', () => {
    it('deve criar um producer com sucesso', async () => {
      const producer = new Producer('123', 'Producer 1', [], '1');
      (prisma.producer.create as jest.Mock).mockResolvedValue({
        id: '1',
        document: '123',
        name: 'Producer 1',
      });

      const result = await repository.create(producer);

      expect(result).toBeInstanceOf(Producer);
      expect(result.cpfCnpj).toBe('123');
      expect(prisma.producer.create).toHaveBeenCalledWith({
        data: { name: 'Producer 1', document: '123' },
      });
    });

    it('deve lançar ConflictException ao violar restrição única (P2002)', async () => {
      const producer = new Producer('123', 'Producer 1', [], '1');
      const error = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
        },
      );
      (prisma.producer.create as jest.Mock).mockRejectedValue(error);

      await expect(repository.create(producer)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar erro genérico para outros erros', async () => {
      const producer = new Producer('123', 'Producer 1', [], '1');
      (prisma.producer.create as jest.Mock).mockRejectedValue(
        new Error('Erro genérico'),
      );

      await expect(repository.create(producer)).rejects.toThrow(
        'Erro genérico',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de producers com fazendas', async () => {
      const fakeList = [
        {
          id: '1',
          document: '123',
          name: 'Producer 1',
          farms: [
            {
              id: '10',
              name: 'Farm 1',
              city: 'City',
              state: 'State',
              totalArea: 100,
              cultivableArea: 50,
              vegetationArea: 50,
              producerId: '1',
            },
          ],
        },
      ];
      (prisma.producer.findMany as jest.Mock).mockResolvedValue(fakeList);

      const result = await repository.findAll();

      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(Producer);
      expect(result[0].farms[0]).toBeInstanceOf(Farm);
    });

    it('deve lançar BadRequestException em erro', async () => {
      (prisma.producer.findMany as jest.Mock).mockRejectedValue(
        new Error('Falha'),
      );

      await expect(repository.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('deve atualizar producer com sucesso', async () => {
      const producer = new Producer('123', 'Producer Updated', [], '1');
      (prisma.producer.update as jest.Mock).mockResolvedValue({
        id: '1',
        document: '123',
        name: 'Producer Updated',
      });

      const result = await repository.update('1', producer);

      expect(result).toBeInstanceOf(Producer);
      expect(result.name).toBe('Producer Updated');
      expect(prisma.producer.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Producer Updated', document: '123' },
      });
    });

    it('deve lançar erro ao ocorrer exceção', async () => {
      (prisma.producer.update as jest.Mock).mockRejectedValue(
        new Error('Falha'),
      );

      await expect(
        repository.update('1', new Producer('123', 'Name', [], '1')),
      ).rejects.toThrow('Falha');
    });
  });

  describe('delete', () => {
    it('deve deletar producer com sucesso', async () => {
      (prisma.producer.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(repository.delete('1')).resolves.toBeUndefined();
      expect(prisma.producer.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('deve lançar erro ao ocorrer exceção', async () => {
      (prisma.producer.delete as jest.Mock).mockRejectedValue(
        new Error('Falha'),
      );

      await expect(repository.delete('1')).rejects.toThrow('Falha');
    });
  });
});
