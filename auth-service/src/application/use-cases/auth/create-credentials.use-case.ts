import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { UserServiceClient } from '../../../infrastructure/clients/user-service.client';

@Injectable()
export class CreateCredentialsUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly userServiceClient: UserServiceClient,
  ) {}

  async execute(data: {
    user_id: number;
    email: string;
    password: string;
  }) {
    // Verify user exists
    const user = await this.userServiceClient.getUserById(data.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if credentials already exist
    const existingAuth = await this.authRepository.findByUserId(data.user_id);
    if (existingAuth) {
      throw new ConflictException('Credentials already exist for this user');
    }

    // Check if email is already used
    const existingAuthByEmail = await this.authRepository.findByEmail(data.email);
    if (existingAuthByEmail) {
      throw new ConflictException('Email already has credentials');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    // Create auth record
    const auth = await this.authRepository.create({
      user_id: data.user_id,
      email: data.email,
      password_hash,
    });

    return auth;
  }
}
