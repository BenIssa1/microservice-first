import { Controller, Post, Body, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateCredentialsDto } from './dto/create-credentials.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Create a new user account. User must login separately to get access tokens.' })
  @ApiResponse({ status: 201, description: 'User registered successfully. Please login to get access tokens.' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user', description: 'Authenticate user and return access tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token', description: 'Get a new access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate token', description: 'Validate an access token and return user information' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }
    return await this.authService.validateToken(token);
  }

  @Post('create-credentials')
  @ApiOperation({ summary: 'Create credentials for existing user', description: 'Create authentication credentials for an existing user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Credentials created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Credentials already exist for this user' })
  async createCredentials(@Body() createCredentialsDto: CreateCredentialsDto) {
    return await this.authService.createCredentials(createCredentialsDto);
  }
}
