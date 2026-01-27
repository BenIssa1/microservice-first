import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/user/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case';
import { GetUserByEmailUseCase } from '../../application/use-cases/user/get-user-by-email.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  async findAll() {
    return await this.getAllUsersUseCase.execute();
  }

  async findOne(id: number) {
    return await this.getUserByIdUseCase.execute(id);
  }

  async findByEmail(email: string) {
    return await this.getUserByEmailUseCase.execute(email);
  }

  async create(createUserDto: CreateUserDto) {
    return await this.createUserUseCase.execute(createUserDto);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Convert date_of_birth from string to Date if provided
    const { date_of_birth, ...rest } = updateUserDto;
    const userData: Partial<User> = {
      ...rest,
    };
    
    if (date_of_birth) {
      userData.date_of_birth = new Date(date_of_birth);
    }
    
    return await this.updateUserUseCase.execute(id, userData);
  }

  async remove(id: number) {
    await this.deleteUserUseCase.execute(id);
  }
}
