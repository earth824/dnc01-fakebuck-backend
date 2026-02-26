import {
  Controller,
  Patch,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { UserService } from 'src/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(FileInterceptor('avatar'))
  @Patch('me/avatar')
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload
  ): Promise<string> {
    return this.userService.uploadAvatar(user.sub, file);
  }

  @UseInterceptors(FileInterceptor('cover'))
  @Patch('me/cover')
  uploadCover(@UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.userService.uploadCover(file);
  }
}
