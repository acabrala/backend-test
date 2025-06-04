import { Farm } from '@/farm/domain/entities/farm.entity';

export interface IFarmRepository {
  create(farm: Farm): Promise<Farm>;
  update(id: string, farm: Farm): Promise<Farm>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Farm | null>;
  findByProducerId(producerId: string): Promise<Farm[]>;
  findAll(): Promise<Farm[]>;
}
