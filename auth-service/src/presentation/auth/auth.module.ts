import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../../domain/entities/auth.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { ValidateTokenUseCase } from '../../application/use-cases/auth/validate-token.use-case';
import { CreateCredentialsUseCase } from '../../application/use-cases/auth/create-credentials.use-case';
import { UserServiceClient } from '../../infrastructure/clients/user-service.client';
import { JwtAuthModule } from '../../infrastructure/jwt/jwt.module';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    HttpModule,
    JwtAuthModule,
    RabbitMQModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    CreateCredentialsUseCase,
    UserServiceClient,
  ],
  exports: [AuthService],
})
export class AuthModule {}
