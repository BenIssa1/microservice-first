import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return await this.userRepository.create({
      ...userData,
      role: userData.role as any || 'user',
      is_active: true,
      email_verified: false,
    });
  }
}
