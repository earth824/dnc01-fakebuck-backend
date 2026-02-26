import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenService } from 'src/shared/security/services/auth-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authTokenService: AuthTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractJwtFromHeader(request);
    if (!token)
      throw new BadRequestException({
        message: 'Authorization is required. Expected: Bearer authorization.',
        code: 'INVALID_AUTHORIZATION_HEADER'
      });

    try {
      const payload = await this.authTokenService.verify(token);
      request.user = payload;
    } catch (error) {
      if (error instanceof Error && error.name === 'JsonWebTokenError')
        throw new UnauthorizedException({
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });

      if (error instanceof Error && error.name === 'TokenExpiredError')
        throw new UnauthorizedException({
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      throw error;
    }

    return true;
  }

  private extractJwtFromHeader(request: Request): string | undefined {
    const [bearer, token] = request.headers.authorization?.split(' ') ?? [];
    return bearer !== 'Bearer' || !token ? undefined : token;
  }
}
