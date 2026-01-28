import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_INTERNAL_KEY } from '../decorators/internal.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const isInternal = this.reflector.getAllAndOverride<boolean>(IS_INTERNAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isInternal) {
      const request = context.switchToHttp().getRequest();
      const serviceToken = request.headers['x-service-token'];
      const expectedServiceToken = process.env.SERVICE_TOKEN || 'internal-service-token';
      
      if (serviceToken === expectedServiceToken) {
        return true;
      }
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw err;
    }
    
    if (!user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active');
      }
      throw new UnauthorizedException('Authentication required. Please provide a valid token.');
    }
    
    return user;
  }
}
