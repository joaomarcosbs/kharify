import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from '../../application/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../../application/dto/category.dto';
import { OrganizationId } from '../../../../common/decorators/organization.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(UserRole.owner, UserRole.gestor)
  @Post()
  create(@OrganizationId() orgId: string, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(orgId, createCategoryDto);
  }

  @Get()
  findAll(@OrganizationId() orgId: string) {
    return this.categoriesService.findAll(orgId);
  }

  @Get(':id')
  findOne(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(orgId, id);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Patch(':id')
  update(@OrganizationId() orgId: string, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(orgId, id, updateCategoryDto);
  }

  @Roles(UserRole.owner, UserRole.gestor)
  @Delete(':id')
  remove(@OrganizationId() orgId: string, @Param('id') id: string) {
    return this.categoriesService.remove(orgId, id);
  }
}
