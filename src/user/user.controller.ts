import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { RelationshipStatus } from 'src/friend/types/friend.type';
import { UserWithoutPassword } from 'src/user/types/user.type';
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
  uploadCover(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload
  ): Promise<string> {
    return this.userService.uploadCover(user.sub, file);
  }

  @Get(':userId/profile')
  async findProfileById(
    @CurrentUser() user: JwtPayload,
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<{
    user: UserWithoutPassword & { friends: UserWithoutPassword[] };
    relationshipStatus: RelationshipStatus;
  }> {
    return await this.userService.findByIdWithRelationToCurrentUser(
      userId,
      user.sub
    );
  }

  @Public()
  @Get()
  async findAll(
    @Query('search') search?: string
  ): Promise<UserWithoutPassword[]> {
    return this.userService.findAll(search);
  }
}
