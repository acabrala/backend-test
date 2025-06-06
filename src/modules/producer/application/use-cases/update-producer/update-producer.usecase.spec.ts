import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProducerUseCase } from './update-producer.usecase';
import { IProducerRepository } from '@/producer/domain/repositories/producer.repository.interface';
import { Producer } from '@/producer/domain/entities/producer.entity';
import { UpdateProducerDTO } from '@/producer/presentation/dto/update-producer.dto';
import { NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common'; // Import Logger if needed, but not mocking globally

// Logger will use its actual implementation or can be spied upon if necessary
// For instance, if we want to check logger.error calls:
// let loggerErrorSpy: jest.SpyInstance;
// BeforeEach: loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
// AfterEach: loggerErrorSpy.mockRestore();


const mockExistingProducer = new Producer(
  '12345678901',
  'Test Producer Original',
  [], // farms
  'producer-id-1', // id
);

const mockUpdatedProducerData = new Producer(
  '12345678901', // document should not change
  'Test Producer Updated', // name changes
  [], // farms
  'producer-id-1', // id
);

describe('UpdateProducerUseCase', () => {
  let useCase: UpdateProducerUseCase;
  let mockProducerRepository: jest.Mocked<IProducerRepository>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Create a fully typed mock for IProducerRepository
    const repositoryMock: IProducerRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findByDocument: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProducerUseCase,
        {
          provide: 'IProducerRepository',
          useValue: repositoryMock,
        },
        // Logger, // Provide a mock logger ONLY if it's an injected dependency of the use case.
                 // Since the use case creates its own instance `new Logger()`, we spy on prototype.
      ],
    }).compile();

    useCase = module.get<UpdateProducerUseCase>(UpdateProducerUseCase);
    mockProducerRepository = module.get('IProducerRepository') as jest.Mocked<IProducerRepository>;

    // Spy on Logger.prototype.error and .log to suppress output and allow verification if needed
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {}); // Spy on log as well
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks(); // This will restore original Logger methods
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('Successful Update', () => {
    it('should update producer name and return the updated producer', async () => {
      const dto: UpdateProducerDTO = { name: 'Test Producer Updated' };
      mockProducerRepository.findById.mockResolvedValue(mockExistingProducer);
      mockProducerRepository.update.mockResolvedValue(mockUpdatedProducerData);

      const result = await useCase.execute('producer-id-1', dto);

      expect(mockProducerRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.findById).toHaveBeenCalledWith('producer-id-1');
      expect(mockProducerRepository.update).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.update).toHaveBeenCalledWith('producer-id-1', { name: dto.name });
      expect(result).toEqual(mockUpdatedProducerData);
    });
  });

  describe('Update with No Name Provided', () => {
    it('should return existing producer without calling update if name is not provided', async () => {
      const dto: UpdateProducerDTO = {}; // name is undefined
      mockProducerRepository.findById.mockResolvedValue(mockExistingProducer);

      const result = await useCase.execute('producer-id-1', dto);

      expect(mockProducerRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.findById).toHaveBeenCalledWith('producer-id-1');
      expect(mockProducerRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockExistingProducer);
    });
  });

  describe('Producer Not Found (on initial findById for check)', () => {
    it('should throw NotFoundException if producer does not exist (first findById)', async () => {
      const dto: UpdateProducerDTO = { name: 'Test Producer Updated' };
      mockProducerRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id', dto)).rejects.toThrow(NotFoundException);
      expect(mockProducerRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockProducerRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Producer Not Found (on findById when name is not provided)', () => {
    it('should throw NotFoundException if producer does not exist (when name is undefined)', async () => {
      const dto: UpdateProducerDTO = {}; // name is undefined
      mockProducerRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id', dto)).rejects.toThrow(NotFoundException);
      expect(mockProducerRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockProducerRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Error during producerRepo.update', () => {
    it('should throw InternalServerErrorException if repository update fails with a generic error', async () => {
      const dto: UpdateProducerDTO = { name: 'Test Producer Updated' };
      const dbError = new Error('DB error');
      mockProducerRepository.findById.mockResolvedValue(mockExistingProducer);
      mockProducerRepository.update.mockRejectedValue(dbError); // Generic error

      await expect(useCase.execute('producer-id-1', dto)).rejects.toThrow(InternalServerErrorException);
      expect(mockProducerRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.findById).toHaveBeenCalledWith('producer-id-1');
      expect(mockProducerRepository.update).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.update).toHaveBeenCalledWith('producer-id-1', { name: dto.name });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Erro ao atualizar produtor com ID producer-id-1: ${dbError.message}`,
        dbError.stack,
      );
    });
  });

  describe('NotFoundException during producerRepo.update', () => {
    it('should re-throw NotFoundException if repository update throws it', async () => {
      const dto: UpdateProducerDTO = { name: 'Test Producer Updated' };
      const notFoundError = new NotFoundException('Producer gone during update');
      mockProducerRepository.findById.mockResolvedValue(mockExistingProducer);
      mockProducerRepository.update.mockRejectedValue(notFoundError);

      await expect(useCase.execute('producer-id-1', dto)).rejects.toThrow(NotFoundException);
      expect(mockProducerRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.findById).toHaveBeenCalledWith('producer-id-1');
      expect(mockProducerRepository.update).toHaveBeenCalledTimes(1);
      expect(mockProducerRepository.update).toHaveBeenCalledWith('producer-id-1', { name: dto.name });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Erro ao atualizar produtor com ID producer-id-1: ${notFoundError.message}`,
        notFoundError.stack,
      );
    });
  });
});
