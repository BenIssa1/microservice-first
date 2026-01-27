import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
