import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountsService } from '../../application/accounts.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
} from '../../application/dto/account.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Roles(UserRole.owner, UserRole.gestor)
  @Post()
  create(
    @OrganizationId() orgId: string,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(orgId, createAccountDto);
  }

  @Get()
  findAll(@OrganizationId() orgId: string) {
    return this.accountsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.accountsService.findOne(orgId, id);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Patch(':id')
  update(
    @OrganizationId() orgId: string,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(orgId, id, updateAccountDto);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete(':id')
  remove(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.accountsService.remove(orgId, id);
  }
}
