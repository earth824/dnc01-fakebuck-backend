import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { LoginDto } from 'src/auth/dtos/login.dto';
import { RegisterDto } from 'src/auth/dtos/register.dto';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';
import { UserWithoutPassword } from 'src/user/types/user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ResponseMessage('Account created successfully')
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto
  ): Promise<{ accessToken: string; user: UserWithoutPassword }> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: JwtPayload
  ): Promise<UserWithoutPassword> {
    return this.authService.getCurrentUser(user.sub);
  }
}
