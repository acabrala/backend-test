import { Test, TestingModule } from '@nestjs/testing';
import { GetDashboardMetricsUseCase } from './dashboard.usecase';

describe('GetDashboardMetricsUseCase', () => {
  let useCase: GetDashboardMetricsUseCase;

  const farmRepoMock = {
    findAll: jest.fn(),
  };

  const cropRepoMock = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDashboardMetricsUseCase,
        { provide: 'IFarmRepository', useValue: farmRepoMock },
        { provide: 'ICropRepository', useValue: cropRepoMock },
      ],
    }).compile();

    useCase = module.get<GetDashboardMetricsUseCase>(
      GetDashboardMetricsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct metrics with farms and crops', async () => {
    const farms = [
      { state: 'SP', totalArea: 100, vegetationArea: 20 },
      { state: 'SP', totalArea: 200, vegetationArea: 50 },
      { state: 'MG', totalArea: 150, vegetationArea: 30 },
    ];

    const crops = [{ name: 'Corn' }, { name: 'Soy' }, { name: 'Corn' }];

    farmRepoMock.findAll.mockResolvedValue(farms);
    cropRepoMock.findAll.mockResolvedValue(crops);

    const result = await useCase.execute();

    expect(farmRepoMock.findAll).toHaveBeenCalled();
    expect(cropRepoMock.findAll).toHaveBeenCalled();

    expect(result.totalFarms).toBe(3);
    expect(result.totalArea).toBe(450);

    expect(result.byState).toEqual({
      SP: 2,
      MG: 1,
    });

    expect(result.landUse).toEqual({
      agricultural: 450,
      vegetation: 100,
    });

    expect(result.byCrop).toEqual({
      Corn: 2,
      Soy: 1,
    });
  });

  it('should handle empty farms and crops', async () => {
    farmRepoMock.findAll.mockResolvedValue([]);
    cropRepoMock.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.totalFarms).toBe(0);
    expect(result.totalArea).toBe(0);
    expect(result.byState).toEqual({});
    expect(result.landUse).toEqual({ agricultural: 0, vegetation: 0 });
    expect(result.byCrop).toEqual({});
  });

  it('should handle farms with missing properties gracefully', async () => {
    const farms = [
      { state: 'SP', totalArea: 100, vegetationArea: 20 },
      { state: 'SP' },
      { state: 'MG', totalArea: 150, vegetationArea: 30 },
    ];

    const crops = [{ name: 'Corn' }];

    farmRepoMock.findAll.mockResolvedValue(farms);
    cropRepoMock.findAll.mockResolvedValue(crops);

    const result = await useCase.execute();

    expect(result.totalFarms).toBe(3);
    expect(result.totalArea).toBe(250);
    expect(result.landUse).toEqual({
      agricultural: 250,
      vegetation: 50,
    });
    expect(result.byState).toEqual({
      SP: 2,
      MG: 1,
    });
    expect(result.byCrop).toEqual({ Corn: 1 });
  });
});
