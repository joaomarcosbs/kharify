import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { DebtsService } from '../../application/debts.service';
import { CreateDebtDto, UpdateDebtDto, SimulateDebtDto } from '../../application/dto/debt.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Roles(UserRole.owner, UserRole.gestor)
  @Post()
  create(@OrganizationId() orgId: string, @Body() dto: CreateDebtDto) {
    return this.debtsService.create(orgId, dto);
  }

  @Get()
  findAll(@OrganizationId() orgId: string) {
    return this.debtsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.debtsService.findOne(orgId, id);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Patch(':id')
  update(@OrganizationId() orgId: string, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
    return this.debtsService.update(orgId, id, dto);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete(':id')
  remove(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.debtsService.remove(orgId, id);
  }

  @Post(':id/simulate')
  simulate(@OrganizationId() orgId: string, @Param('id') id: string, @Body() dto: SimulateDebtDto) {
    return this.debtsService.simulate(orgId, id, dto);
  }
}
