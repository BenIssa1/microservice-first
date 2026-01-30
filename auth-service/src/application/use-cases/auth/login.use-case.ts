import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { UserServiceClient } from '../../../infrastructure/clients/user-service.client';
import { JwtAuthService } from '../../../infrastructure/jwt/jwt.service';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly userServiceClient: UserServiceClient,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(email: string, password: string) {

    // Find auth by email
    const auth = await this.authRepository.findByEmail(email);
    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (auth.is_locked) {
      throw new UnauthorizedException('Account is locked');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, auth.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = auth.failed_login_attempts + 1;
      await this.authRepository.update(auth.user_id, {
        failed_login_attempts: failedAttempts,
        is_locked: failedAttempts >= 5,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('auth', auth);

    // Reset failed attempts on successful login
    await this.authRepository.update(auth.user_id, {
      failed_login_attempts: 0,
      last_login_at: new Date(),
    });

    // Get user from User Service
    const user = await this.userServiceClient.getUserById(auth.user_id);

    console.log('user', user);

    // Generate tokens
    const tokens = await this.jwtAuthService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('tokens', tokens);

    // Update refresh token in auth
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days

    await this.authRepository.update(auth.user_id, {
      refresh_token: tokens.refresh_token,
      refresh_token_expires_at: refreshTokenExpiresAt,
    });

    return {
      user,
      ...tokens,
    };
  }
}
