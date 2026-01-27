import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentService {
  private readonly paymentServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL') || 'http://localhost:3003';
  }

  async findAll(reservationId?: number) {
    try {
      const url = reservationId 
        ? `${this.paymentServiceUrl}/payments?reservationId=${reservationId}`
        : `${this.paymentServiceUrl}/payments`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch payments',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.paymentServiceUrl}/payments/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Payment not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(createPaymentDto: CreatePaymentDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.paymentServiceUrl}/payments`, createPaymentDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async process(id: number, processPaymentDto: ProcessPaymentDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.paymentServiceUrl}/payments/${id}/process`, processPaymentDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to process payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
