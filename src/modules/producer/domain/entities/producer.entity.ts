import { Farm } from '@/farm/domain/entities/farm.entity';
import { v4 as uuidv4 } from 'uuid';

export class Producer {
  private _document: string;
  private _name: string;
  private _farms: Farm[];
  public readonly id?: string;

  constructor(document: string, name: string, farms: Farm[] = [], id?: string) {
    if (!document) {
      throw new Error('CPF/CNPJ é obrigatório.');
    }
    if (!name || name.trim().length < 3) {
      throw new Error('Nome inválido: mínimo 3 caracteres.');
    }

    this.id = id ?? uuidv4();
    this._document = document;
    this._name = name.trim();
    this._farms = [...farms];

    this.validateInvariant();
  }

  get cpfCnpj(): string {
    return this._document;
  }

  get name(): string {
    return this._name;
  }

  get farms(): ReadonlyArray<Farm> {
    return this._farms;
  }

  addFarm(farm: Farm) {
    if (this._farms.find((f) => f.id === farm.id)) {
      throw new Error(`Fazenda com id ${farm.id} já cadastrada.`);
    }
    this._farms.push(farm);
    this.validateInvariant();
  }

  private validateInvariant() {
    if (!this._name) {
      throw new Error('Produtor deve ter um nome válido.');
    }
  }
}
