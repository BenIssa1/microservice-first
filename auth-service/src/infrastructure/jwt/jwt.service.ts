import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<TokenResponse> {
    const accessTokenExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    // Calculate expires_in in seconds
    const expiresInMatch = accessTokenExpiresIn.match(/(\d+)([mhd])/);
    let expiresIn = 900; // default 15 minutes
    if (expiresInMatch) {
      const value = parseInt(expiresInMatch[1]);
      const unit = expiresInMatch[2];
      expiresIn = unit === 'm' ? value * 60 : unit === 'h' ? value * 3600 : value * 86400;
    }

    return {
      access_token,
      refresh_token,
      expires_in: expiresIn,
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
