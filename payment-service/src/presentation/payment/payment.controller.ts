import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  findAll(@Query('reservationId') reservationId?: string) {
    return this.paymentService.findAll(reservationId ? +reservationId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Post(':id/process')
  process(@Param('id') id: string, @Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentService.process(+id, processPaymentDto);
  }
}
