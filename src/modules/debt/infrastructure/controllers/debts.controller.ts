import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DebtsService } from '../../application/debts.service';
import { CreateDebtDto, SimulateDebtDto } from '../../application/dto/debt.dto';
import { JwtAuthGuard } from '../../../../modules/organization/infrastructure/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@Body() dto: CreateDebtDto) {
    return this.debtsService.create(dto);
  }

  @Get()
  findAll() {
    return this.debtsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(id);
  }

  @Post(':id/simulate')
  simulate(@Param('id') id: string, @Body() dto: SimulateDebtDto) {
    return this.debtsService.simulate(id, dto);
  }
}
