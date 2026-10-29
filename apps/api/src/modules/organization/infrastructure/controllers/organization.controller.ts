import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { OrganizationService } from '../../application/organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, AddMemberDto } from '../../application/dto/organization.dto';
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { UserRole } from '@prisma/client';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  findAllForUser(@CurrentUser() user: any) {
    return this.organizationService.findAllForUser(user.userId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(user.userId, dto);
  }

  @Get('active')
  getActiveOrganization(@CurrentUser() user: any, @OrganizationId() orgId: string) {
    return this.organizationService.getActiveOrganization(orgId, user.userId);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationService.update(id, dto);
  }

  @Roles(UserRole.owner)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.organizationService.getMembers(id);
  }

  @Roles(UserRole.owner)
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.organizationService.addMember(id, dto);
  }
}
