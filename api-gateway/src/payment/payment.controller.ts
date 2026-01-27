import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles('user', 'admin')
  @Get()
  @ApiOperation({ summary: 'Get all payments', description: 'Retrieve a list of all payments, optionally filtered by reservation ID' })
  @ApiQuery({ name: 'reservationId', required: false, description: 'Filter payments by reservation ID' })
  @ApiResponse({ status: 200, description: 'List of payments retrieved successfully' })
  findAll(@Query('reservationId') reservationId?: string, @CurrentUser() user?: any) {
    return this.paymentService.findAll(reservationId ? +reservationId : undefined);
  }

  @Roles('user', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID', description: 'Retrieve a specific payment by its ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Roles('user', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a new payment', description: 'Create a new payment record' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Roles('user', 'admin')
  @Post(':id/process')
  @ApiOperation({ summary: 'Process payment', description: 'Process a payment with a payment token' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment processing failed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  process(@Param('id') id: string, @Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentService.process(+id, processPaymentDto);
  }
}
