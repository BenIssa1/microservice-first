import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/user/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case';
import { GetUserByEmailUseCase } from '../../application/use-cases/user/get-user-by-email.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    CreateUserUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UserService, 'IUserRepository'],
})
export class UserModule {}
