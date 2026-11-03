import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BillsService } from '../../application/bills.service';
import { CreateBillDto, UpdateBillDto } from '../../application/dto/bill.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Roles(UserRole.owner, UserRole.gestor, UserRole.membro)
  @Post()
  create(@OrganizationId() orgId: string, @Body() dto: CreateBillDto) {
    return this.billsService.create(orgId, dto);
  }

  @Get()
  findAll(@OrganizationId() orgId: string) {
    return this.billsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.billsService.findOne(orgId, id);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Patch(':id')
  update(
    @OrganizationId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBillDto,
  ) {
    return this.billsService.update(orgId, id, dto);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete(':id')
  remove(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.billsService.remove(orgId, id);
  }
}
