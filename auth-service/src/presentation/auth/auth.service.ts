import { Injectable } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { ValidateTokenUseCase } from '../../application/use-cases/auth/validate-token.use-case';
import { CreateCredentialsUseCase } from '../../application/use-cases/auth/create-credentials.use-case';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateCredentialsDto } from './dto/create-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly createCredentialsUseCase: CreateCredentialsUseCase,
  ) {}

  async register(registerDto: RegisterDto) {
    return await this.registerUseCase.execute(registerDto);
  }

  async login(loginDto: LoginDto) {
    console.log('loginDto', loginDto);
    return await this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenUseCase.execute(refreshTokenDto.refresh_token);
  }

  async validateToken(token: string) {
    return await this.validateTokenUseCase.execute(token);
  }

  async createCredentials(createCredentialsDto: CreateCredentialsDto) {
    return await this.createCredentialsUseCase.execute(createCredentialsDto);
  }
}
