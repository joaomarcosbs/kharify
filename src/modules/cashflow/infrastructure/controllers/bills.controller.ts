import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BillsService } from '../../application/bills.service';
import { CreateBillDto, UpdateBillDto } from '../../application/dto/bill.dto';
import { JwtAuthGuard } from '../../../../modules/organization/infrastructure/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Get()
  findAll() {
    return this.billsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billsService.remove(id);
  }
}
