import { Crop } from '@/crop/domain/entities/crop.entity';

export class Farm {
  public readonly id: string;
  public name: string;
  public city: string;
  public state: string;
  public totalArea: number;
  public cultivableArea: number;
  public vegetationArea: number;
  public crops: Crop[];
  public producerId: string;

  constructor(
    id: string,
    name: string,
    city: string,
    state: string,
    totalArea: number,
    cultivableArea: number,
    vegetationArea: number,
    producerId: string,
    crops: Crop[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.city = city;
    this.state = state;
    this.totalArea = totalArea;
    this.cultivableArea = cultivableArea;
    this.vegetationArea = vegetationArea;
    this.producerId = producerId;
    this.crops = crops;

    if (!this.isValidArea()) {
      throw new Error(
        'A soma da área agricultável e da vegetação não pode ultrapassar a área total',
      );
    }
  }

  addCrop(crop: Crop) {
    this.crops.push(crop);
  }

  private isValidArea(): boolean {
    return this.cultivableArea + this.vegetationArea <= this.totalArea;
  }
}
