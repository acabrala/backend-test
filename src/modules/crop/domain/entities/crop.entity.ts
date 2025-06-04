import { v4 as uuidv4 } from 'uuid';

export class Crop {
  public readonly id: string;
  public farmId: string;
  public name: string;
  public plantedArea: number;
  public plantedAt: Date;
  public harvestedAt?: Date;

  constructor(
    id: string | null,
    farmId: string,
    name: string,
    plantedArea: number,
    plantedAt: Date,
    harvestedAt?: Date
  ) {
    this.id = id ?? this.generateId();
    this.farmId = farmId;
    this.name = name;
    this.plantedArea = plantedArea;
    this.plantedAt = plantedAt;
    this.harvestedAt = harvestedAt;

    if (this.plantedArea <= 0) {
      throw new Error('A área da cultura deve ser maior que zero.');
    }
  }

  private generateId(): string {
    return uuidv4();
  }
}
