import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../../application/dashboard.service';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@OrganizationId() orgId: string) {
    return this.dashboardService.getSummary(orgId);
  }

  @Get('cashflow-monthly')
  getCashflowMonthly(@OrganizationId() orgId: string) {
    return this.dashboardService.getCashflowMonthly(orgId);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(@OrganizationId() orgId: string) {
    return this.dashboardService.getCategoryBreakdown(orgId);
  }

  @Get('cost-center-breakdown')
  getCostCenterBreakdown(@OrganizationId() orgId: string) {
    return this.dashboardService.getCostCenterBreakdown(orgId);
  }
}
