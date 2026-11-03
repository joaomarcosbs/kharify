import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from '../../application/transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '../../application/dto/transaction.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(UserRole.owner, UserRole.gestor, UserRole.membro)
  @Post()
  create(@OrganizationId() orgId: string, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(orgId, dto);
  }

  @Get()
  findAll(@OrganizationId() orgId: string) {
    return this.transactionsService.findAll(orgId);
  }

  @Roles(UserRole.owner, UserRole.gestor, UserRole.membro)
  @Patch(':id')
  update(
    @OrganizationId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(orgId, id, dto);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete(':id')
  remove(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.transactionsService.remove(orgId, id);
  }
}
