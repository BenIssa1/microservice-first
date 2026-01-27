import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { UserServiceClient } from '../../../infrastructure/clients/user-service.client';
import { JwtAuthService } from '../../../infrastructure/jwt/jwt.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly userServiceClient: UserServiceClient,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtAuthService.verifyRefreshToken(refreshToken);

      // Find auth record
      const auth = await this.authRepository.findByUserId(payload.sub);
      if (!auth || auth.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (auth.refresh_token_expires_at && auth.refresh_token_expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Get user
      const user = await this.userServiceClient.getUserById(payload.sub);

      // Generate new tokens
      const tokens = await this.jwtAuthService.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Update refresh token
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

      await this.authRepository.update(auth.user_id, {
        refresh_token: tokens.refresh_token,
        refresh_token_expires_at: refreshTokenExpiresAt,
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
