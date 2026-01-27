import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3006';
  }

  async register(registerDto: RegisterDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to register user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to login',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/refresh`, refreshTokenDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to refresh token',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateToken(token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Invalid token',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
