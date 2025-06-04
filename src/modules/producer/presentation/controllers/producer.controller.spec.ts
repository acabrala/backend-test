import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from './producer.controller';
import { CreateProducerUseCase } from '@/producer/application/use-cases/create-producer/create-producer.usecase';
import { ListProducersUseCase } from '@/producer/application/use-cases/list-producer/list-producers.use-case';
import { UpdateProducerUseCase } from '@/producer/application/use-cases/update-producer/update-producer.usecase';
import { DeleteProducerUseCase } from '@/producer/application/use-cases/delete-producer/delete-producer.usecase';
import { BadRequestException } from '@nestjs/common';

describe('ProducerController', () => {
  let controller: ProducerController;
  let createUseCase: CreateProducerUseCase;
  let listUseCase: ListProducersUseCase;
  let updateUseCase: UpdateProducerUseCase;
  let deleteUseCase: DeleteProducerUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [
        {
          provide: CreateProducerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListProducersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateProducerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteProducerUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProducerController>(ProducerController);
    createUseCase = module.get<CreateProducerUseCase>(CreateProducerUseCase);
    listUseCase = module.get<ListProducersUseCase>(ListProducersUseCase);
    updateUseCase = module.get<UpdateProducerUseCase>(UpdateProducerUseCase);
    deleteUseCase = module.get<DeleteProducerUseCase>(DeleteProducerUseCase);
  });

  describe('create', () => {
    it('deve criar um produtor e retornar dados', async () => {
      const dto = { name: 'Produtor Teste', document: '12345678900' };

      const result = {
        id: '1',
        name: dto.name,
        cpfCnpj: dto.document,
      } as any;

      jest.spyOn(createUseCase, 'execute').mockResolvedValue(result);

      const response = await controller.create(dto);

      expect(createUseCase.execute).toHaveBeenCalledWith(dto);
      expect(response).toEqual({
        id: result.id,
        name: result.name,
        document: result.cpfCnpj,
      });
    });

    it('deve lançar BadRequestException ao ocorrer erro', async () => {
      const dto = { name: 'Produtor Teste', document: '12345678900' };
      jest
        .spyOn(createUseCase, 'execute')
        .mockRejectedValue(new Error('Falha'));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de produtores', async () => {
      const producers = [
        { id: '1', name: 'Produtor 1', cpfCnpj: '11111111111' },
        { id: '2', name: 'Produtor 2', cpfCnpj: '22222222222' },
      ] as any[];

      jest.spyOn(listUseCase, 'execute').mockResolvedValue(producers);

      const response = await controller.findAll();

      expect(listUseCase.execute).toHaveBeenCalled();
      expect(response).toBe(producers);
    });

    it('deve lançar BadRequestException ao ocorrer erro', async () => {
      jest.spyOn(listUseCase, 'execute').mockRejectedValue(new Error('Falha'));

      await expect(controller.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('deve atualizar produtor e retornar dados', async () => {
      const id = '1';
      const dto = { name: 'Produtor Atualizado', document: '99999999999' };

      const updated = {
        id,
        name: dto.name,
        cpfCnpj: dto.document,
      } as any;

      jest.spyOn(updateUseCase, 'execute').mockResolvedValue(updated);

      const result = await controller.update(id, dto);

      expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({
        id: updated.id,
        name: updated.name,
        document: updated.cpfCnpj,
      });
    });

    it('deve lançar BadRequestException ao ocorrer erro', async () => {
      const id = '1';
      const dto = { name: 'Produtor Atualizado', document: '99999999999' };
      jest
        .spyOn(updateUseCase, 'execute')
        .mockRejectedValue(new Error('Falha'));

      await expect(controller.update(id, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('deve remover produtor com sucesso', async () => {
      const id = '1';
      jest.spyOn(deleteUseCase, 'execute').mockResolvedValue(undefined);

      const response = await controller.delete(id);

      expect(deleteUseCase.execute).toHaveBeenCalledWith(id);
      expect(response).toEqual({ message: 'Produtor removido com sucesso' });
    });

    it('deve lançar BadRequestException ao ocorrer erro', async () => {
      const id = '1';
      jest
        .spyOn(deleteUseCase, 'execute')
        .mockRejectedValue(new Error('Falha'));

      await expect(controller.delete(id)).rejects.toThrow(BadRequestException);
    });
  });
});
