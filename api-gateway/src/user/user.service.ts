import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly userServiceUrl: string;
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') || 'http://localhost:3005';
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3006';
  }

  async findAll() {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.userServiceUrl}/users`));
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch users',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'User not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    // Extract password if provided
    const { password, ...userData } = createUserDto;
    
    let user;
    try {
      // Create user in User Service
      user = await firstValueFrom(
        this.httpService.post(`${this.userServiceUrl}/users`, userData),
      ).then(response => response.data);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // If password is provided, create credentials in Auth Service
    if (password) {
      try {
        await firstValueFrom(
          this.httpService.post(`${this.authServiceUrl}/auth/create-credentials`, {
            user_id: user.id,
            email: user.email,
            password: password,
          }),
        );
      } catch (authError) {
        // If credentials creation fails, try to delete the user (compensating action)
        try {
          await firstValueFrom(
            this.httpService.delete(`${this.userServiceUrl}/users/${user.id}`),
          );
        } catch (cleanupError) {
          console.error(`Failed to cleanup user ${user.id} after credentials creation failure:`, cleanupError);
        }
        // Throw the original auth error
        throw new HttpException(
          authError.response?.data || 'Failed to create credentials',
          authError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.userServiceUrl}/users/${id}`, updateUserDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to update user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.userServiceUrl}/users/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to delete user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
