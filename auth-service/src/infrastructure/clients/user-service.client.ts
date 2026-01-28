import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserServiceClient {
  private readonly userServiceUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') || 'http://localhost:3005';
    this.serviceToken = this.configService.get<string>('SERVICE_TOKEN') || 'internal-service-token';
  }

  private getServiceHeaders() {
    return {
      'X-Service-Token': this.serviceToken,
    };
  }

  async getUserById(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${id}`, {
          headers: this.getServiceHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'User not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      // Note: This endpoint might need to be added to User Service
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/email/${email}`, {
          headers: this.getServiceHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.userServiceUrl}/users`, userData, {
          headers: this.getServiceHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(userId: number) {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.userServiceUrl}/users/${userId}`, {
          headers: this.getServiceHeaders(),
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to delete user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
