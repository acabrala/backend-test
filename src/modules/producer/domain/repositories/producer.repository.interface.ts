import { Producer } from '@/producer/domain/entities/producer.entitry';

export interface IProducerRepository {
  findAll(): Promise<Producer[]>;
  findByDocument(document: string): Promise<Producer | null>;
  create(producer: Producer): Promise<Producer>;
  update(id: string, producer: Producer): Promise<Producer>;
  delete(id: string): Promise<void>;
}
