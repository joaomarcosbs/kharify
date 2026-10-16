import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PluggyService } from '../../application/pluggy.service';
import { RegisterPluggyItemDto } from '../../application/dto/pluggy.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('pluggy')
export class PluggyController {
  constructor(private readonly pluggyService: PluggyService) {}

  @Roles(UserRole.owner, UserRole.gestor, UserRole.membro)
  @Post('connect-token')
  createConnectToken(@OrganizationId() orgId: string) {
    return this.pluggyService.createConnectToken(orgId);
  }

  @Roles(UserRole.owner, UserRole.gestor, UserRole.membro)
  @Post('items')
  registerItem(@OrganizationId() orgId: string, @Body() dto: RegisterPluggyItemDto) {
    return this.pluggyService.registerItem(orgId, dto);
  }

  @Roles(UserRole.owner, UserRole.gestor, UserRole.membro)
  @Post('items/:id/sync')
  syncItem(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.pluggyService.syncItemById(orgId, id);
  }

  @Public()
  @Post('webhooks')
  handleWebhook(@Body() payload: any) {
    return this.pluggyService.handleWebhook(payload);
  }

  @Get('items')
  getItems(@OrganizationId() orgId: string) {
    return this.pluggyService.getItems(orgId);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete('items/:id')
  deleteItem(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.pluggyService.deleteItem(orgId, id);
  }
}
