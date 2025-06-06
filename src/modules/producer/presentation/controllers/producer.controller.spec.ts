import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from './producer.controller';
import { CreateProducerUseCase } from '@/producer/application/use-cases/create-producer/create-producer.usecase';
import { ListProducersUseCase } from '@/producer/application/use-cases/list-producer/list-producers.use-case';
import { UpdateProducerUseCase } from '@/producer/application/use-cases/update-producer/update-producer.usecase';
import { DeleteProducerUseCase } from '@/producer/application/use-cases/delete-producer/delete-producer.usecase';
import { UpdateProducerDTO } from '@/producer/presentation/dto/update-producer.dto';
import { Producer } from '@/producer/domain/entities/producer.entity';
import { Farm } from '@/farm/domain/entities/farm.entity'; // Corrected import path
import { Crop } from '@/crop/domain/entities/crop.entity';   // Corrected import path
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

// Sample data
const mockProducerId = 'producer-id-123';
const mockFarmId = 'farm-id-1';

// Mock Domain Entities that ListProducersUseCase would return
const mockCropDomainSoy = new Crop('crop-id-1', mockFarmId, 'Soy', 10.5, new Date('2023-01-15'), new Date('2023-05-15'));
const mockCropDomainCorn = new Crop('crop-id-2', mockFarmId, 'Corn', 20.0, new Date('2023-03-01'), new Date('2023-07-01'));

const mockFarmDomain = new Farm(
  mockFarmId,
  'Farm Name',
  'City',
  'ST',
  100,
  50,
  20,
  mockProducerId,
  [mockCropDomainSoy, mockCropDomainCorn]
);

const mockProducerDomainEntity = new Producer(
  '12345678901',
  'Test Producer',
  [mockFarmDomain],
  mockProducerId,
);

const mockUpdatedDomainProducer = new Producer(
  '12345678901',
  'Updated Test Producer',
  [],
  mockProducerId,
);

describe('ProducerController', () => {
  let controller: ProducerController;
  let listProducersUseCase: jest.Mocked<ListProducersUseCase>;
  let updateProducerUseCase: jest.Mocked<UpdateProducerUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [
        { provide: CreateProducerUseCase, useValue: { execute: jest.fn() } },
        { provide: ListProducersUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateProducerUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteProducerUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProducerController>(ProducerController);
    listProducersUseCase = module.get(ListProducersUseCase);
    updateProducerUseCase = module.get(UpdateProducerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call listProducers.execute once', async () => {
      listProducersUseCase.execute.mockResolvedValueOnce([mockProducerDomainEntity]);
      await controller.findAll();
      expect(listProducersUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the result from listProducers.execute (which are domain Producer entities)', async () => {
      const expectedProducers = [mockProducerDomainEntity];
      listProducersUseCase.execute.mockResolvedValueOnce(expectedProducers);
      const result = await controller.findAll();
      expect(result).toEqual(expectedProducers);
    });

    it('should throw InternalServerErrorException if listProducers.execute throws an error', async () => {
      listProducersUseCase.execute.mockRejectedValueOnce(new Error('Some random error'));
      await expect(controller.findAll()).rejects.toThrow(
        new InternalServerErrorException('Erro ao buscar produtores'),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateProducerDTO = { name: 'Updated Test Producer' };
    const expectedResponseFromUpdate = {
      id: mockUpdatedDomainProducer.id,
      name: mockUpdatedDomainProducer.name,
      document: mockUpdatedDomainProducer.cpfCnpj,
    };

    it('should call updateProducer.execute with the correct id and UpdateProducerDTO', async () => {
      updateProducerUseCase.execute.mockResolvedValueOnce(mockUpdatedDomainProducer);
      await controller.update(mockProducerId, updateDto);
      expect(updateProducerUseCase.execute).toHaveBeenCalledWith(mockProducerId, updateDto);
    });

    it('should return the transformed result from updateProducer.execute', async () => {
      updateProducerUseCase.execute.mockResolvedValueOnce(mockUpdatedDomainProducer);
      const result = await controller.update(mockProducerId, updateDto);
      expect(result).toEqual(expectedResponseFromUpdate);
    });

    it('should throw BadRequestException if updateProducer.execute throws a generic error', async () => {
      const genericError = new Error('Some generic use case error');
      updateProducerUseCase.execute.mockRejectedValueOnce(genericError);
      await expect(controller.update(mockProducerId, updateDto)).rejects.toThrow(
        new BadRequestException(genericError.message),
      );
    });

    it('should throw BadRequestException if updateProducer.execute throws a BadRequestException', async () => {
      const badRequestError = new BadRequestException('Specific bad request from use case');
      updateProducerUseCase.execute.mockRejectedValueOnce(badRequestError);
      await expect(controller.update(mockProducerId, updateDto)).rejects.toThrow(
        new BadRequestException(badRequestError.message),
      );
    });

    it('should throw BadRequestException if updateProducer.execute throws a NotFoundException (due to current controller error handling)', async () => {
      const notFoundError = new NotFoundException('Producer not found from use case');
      updateProducerUseCase.execute.mockRejectedValueOnce(notFoundError);
      await expect(controller.update(mockProducerId, updateDto)).rejects.toThrow(
         new BadRequestException(notFoundError.message)
      );
    });

    it('should throw BadRequestException if updateProducer.execute throws an InternalServerErrorException from use case', async () => {
      const internalError = new InternalServerErrorException('Internal Error from use case');
      updateProducerUseCase.execute.mockRejectedValueOnce(internalError);
      await expect(controller.update(mockProducerId, updateDto)).rejects.toThrow(
        new BadRequestException(internalError.message)
      );
    });

    it('should ensure the response format matches { id, name, document }', async () => {
      updateProducerUseCase.execute.mockResolvedValueOnce(mockUpdatedDomainProducer);
      const result = await controller.update(mockProducerId, updateDto);
      expect(result).toHaveProperty('id', mockUpdatedDomainProducer.id);
      expect(result).toHaveProperty('name', mockUpdatedDomainProducer.name);
      expect(result).toHaveProperty('document', mockUpdatedDomainProducer.cpfCnpj);
      expect(Object.keys(result).length).toBe(3);
    });
  });
});
