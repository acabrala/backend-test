import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDashboardMetricsUseCase } from '@/dashboard/application/use-cases/dashboard/dashboard.usecase';
import { DashboardMetricsDto } from '@/dashboard/presentation/dto/get-dashboard.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly getMetricsUseCase: GetDashboardMetricsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obter dados agregados do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Resumo estatístico do sistema',
    type: DashboardMetricsDto,
  })
  async getDashboard() {
    try {
      this.logger.log('Requisição para dashboard');
      return await this.getMetricsUseCase.execute();
    } catch (error) {
      this.logger.error('Erro ao obter dashboard', error.stack);
      throw error;
    }
  }
}
