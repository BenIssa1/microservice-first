import { Injectable } from '@nestjs/common';
import { JwtAuthService } from '../../../infrastructure/jwt/jwt.service';
import { UserServiceClient } from '../../../infrastructure/clients/user-service.client';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly userServiceClient: UserServiceClient,
  ) {}

  async execute(token: string) {
    try {
      const payload = await this.jwtAuthService.verifyToken(token);
      const user = await this.userServiceClient.getUserById(payload.sub);
      return {
        valid: true,
        user,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
  }
}
