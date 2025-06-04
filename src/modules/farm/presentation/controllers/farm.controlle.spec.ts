import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from '@/farm/presentation/controllers/farm.controller';
import { CreateFarmUseCase } from '@/farm/application/use-cases/create-farm/create-farm.usecase';
import { UpdateFarmUseCase } from '@/farm/application/use-cases/update-farm/update-farm.usecase';
import { DeleteFarmUseCase } from '@/farm/application/use-cases/delete-farm/delete-farm.usecase';
import { ListFarmsByProducerUseCase } from '@/farm/application/use-cases/list-farm-by-producer/list-farms-by-producer.usecase';
import { Farm } from '@/farm/domain/entities/farm.entity';

describe('FarmController', () => {
  let controller: FarmController;
  let createUseCase: CreateFarmUseCase;
  let updateUseCase: UpdateFarmUseCase;
  let deleteUseCase: DeleteFarmUseCase;
  let listUseCase: ListFarmsByProducerUseCase;

  const completeCreateFarmDto = {
    name: 'Fazenda Teste',
    city: 'São Paulo',
    state: 'SP',
    totalArea: 100,
    cultivableArea: 60,
    vegetationArea: 40,
    producerId: 'prod-1',
  };

  const completeUpdateFarmDto = {
    name: 'Fazenda Atualizada',
    city: 'Campinas',
    state: 'SP',
    totalArea: 120,
    cultivableArea: 80,
    vegetationArea: 40,
    producerId: 'prod-1',
  };

  const completeFarmEntity = new Farm(
    '1',
    completeCreateFarmDto.name,
    completeCreateFarmDto.city,
    completeCreateFarmDto.state,
    completeCreateFarmDto.totalArea,
    completeCreateFarmDto.cultivableArea,
    completeCreateFarmDto.vegetationArea,
    completeCreateFarmDto.producerId,
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmController],
      providers: [
        {
          provide: CreateFarmUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateFarmUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteFarmUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListFarmsByProducerUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<FarmController>(FarmController);
    createUseCase = module.get<CreateFarmUseCase>(CreateFarmUseCase);
    updateUseCase = module.get<UpdateFarmUseCase>(UpdateFarmUseCase);
    deleteUseCase = module.get<DeleteFarmUseCase>(DeleteFarmUseCase);
    listUseCase = module.get<ListFarmsByProducerUseCase>(
      ListFarmsByProducerUseCase,
    );
  });

  describe('create', () => {
    it('should create a farm successfully', async () => {
      jest
        .spyOn(createUseCase, 'execute')
        .mockResolvedValue(completeFarmEntity);

      const result = await controller.create(completeCreateFarmDto);

      expect(createUseCase.execute).toHaveBeenCalledWith(completeCreateFarmDto);
      expect(result).toEqual(completeFarmEntity);
    });

    it('should throw error when create fails', async () => {
      jest.spyOn(createUseCase, 'execute').mockRejectedValue(new Error('fail'));

      await expect(controller.create(completeCreateFarmDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a farm successfully', async () => {
      jest
        .spyOn(updateUseCase, 'execute')
        .mockResolvedValue(completeFarmEntity);

      const result = await controller.update('1', completeUpdateFarmDto);

      expect(updateUseCase.execute).toHaveBeenCalledWith(
        '1',
        completeUpdateFarmDto,
      );
      expect(result).toEqual(completeFarmEntity);
    });

    it('should throw error when update fails', async () => {
      jest.spyOn(updateUseCase, 'execute').mockRejectedValue(new Error('fail'));

      await expect(
        controller.update('1', completeUpdateFarmDto),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a farm successfully', async () => {
      jest.spyOn(deleteUseCase, 'execute').mockResolvedValue(undefined);

      const result = await controller.delete('1');

      expect(deleteUseCase.execute).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Fazenda deletada com sucesso.' });
    });

    it('should throw error when delete fails', async () => {
      jest.spyOn(deleteUseCase, 'execute').mockRejectedValue(new Error('fail'));

      await expect(controller.delete('1')).rejects.toThrow();
    });
  });

  describe('getFarmsByProducer', () => {
    it('should list farms by producer', async () => {
      jest
        .spyOn(listUseCase, 'execute')
        .mockResolvedValue([completeFarmEntity]);

      const result = await controller.getFarmsByProducer('prod-1');

      expect(listUseCase.execute).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual([completeFarmEntity]);
    });

    it('should throw error when list fails', async () => {
      jest.spyOn(listUseCase, 'execute').mockRejectedValue(new Error('fail'));

      await expect(controller.getFarmsByProducer('prod-1')).rejects.toThrow();
    });
  });
});
