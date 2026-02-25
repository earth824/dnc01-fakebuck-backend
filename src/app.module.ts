import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }]
})
export class AppModule {}
