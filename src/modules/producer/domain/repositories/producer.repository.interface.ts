import { Producer } from '@/producer/domain/entities/producer.entity';

export interface IProducerRepository {
  findAll(): Promise<Producer[]>;
  findByDocument(document: string): Promise<Producer | null>;
  findById(id: string): Promise<Producer | null>;
  create(producer: Producer): Promise<Producer>;
  update(id: string, data: { name: string }): Promise<Producer>;
  delete(id: string): Promise<void>;
}
