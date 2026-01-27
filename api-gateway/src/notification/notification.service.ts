import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL') || 'http://localhost:3004';
  }

  async findAll(userId?: number) {
    try {
      const url = userId 
        ? `${this.notificationServiceUrl}/notifications?userId=${userId}`
        : `${this.notificationServiceUrl}/notifications`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch notifications',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.notificationServiceUrl}/notifications/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Notification not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/notifications`, createNotificationDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create notification',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
