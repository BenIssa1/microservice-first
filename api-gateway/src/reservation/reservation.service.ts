import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  private readonly reservationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.reservationServiceUrl = this.configService.get<string>('RESERVATION_SERVICE_URL') || 'http://localhost:3002';
  }

  async findAll(userId?: number) {
    try {
      const url = userId 
        ? `${this.reservationServiceUrl}/reservations?userId=${userId}`
        : `${this.reservationServiceUrl}/reservations`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch reservations',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reservationServiceUrl}/reservations/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Reservation not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(createReservationDto: CreateReservationDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.reservationServiceUrl}/reservations`, createReservationDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create reservation',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.reservationServiceUrl}/reservations/${id}`, updateReservationDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to update reservation',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancel(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.reservationServiceUrl}/reservations/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to cancel reservation',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
