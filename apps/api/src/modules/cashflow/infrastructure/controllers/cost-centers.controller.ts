import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CostCentersService } from '../../application/cost-centers.service';
import {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from '../../application/dto/cost-center.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Roles(UserRole.owner, UserRole.gestor)
  @Post()
  create(@OrganizationId() orgId: string, @Body() dto: CreateCostCenterDto) {
    return this.costCentersService.create(orgId, dto);
  }

  @Get()
  findAll(@OrganizationId() orgId: string) {
    return this.costCentersService.findAll(orgId);
  }

  @Get(':id')
  findOne(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.costCentersService.findOne(orgId, id);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Patch(':id')
  update(
    @OrganizationId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.costCentersService.update(orgId, id, dto);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete(':id')
  remove(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.costCentersService.remove(orgId, id);
  }
}
