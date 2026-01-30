import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { UserServiceClient } from '../../../infrastructure/clients/user-service.client';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly userServiceClient: UserServiceClient,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  async execute(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    // Check if auth already exists
    const existingAuth = await this.authRepository.findByEmail(data.email);
    if (existingAuth) {
      throw new ConflictException('User with this email already exists');
    }

    // Also check if user exists (to avoid orphaned users)
    const existingUser = await this.userServiceClient.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password BEFORE creating user (fail fast if password hashing fails)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    // Create user in User Service
    // If this fails, we haven't created auth yet, so error will propagate naturally
    const user = await this.userServiceClient.createUser({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: 'user',
    });

    try {
      // Create auth record
      await this.authRepository.create({
        user_id: user.id,
        email: data.email,
        password_hash,
      });

      // Send notification event via NestJS microservices (non-blocking, fire and forget)
      this.notificationClient
        .emit('user.registered', {
          userId: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
        })
        .subscribe({
          error: (err) => {
            console.error('[AUTH SERVICE] Failed to send registration notification:', err);
          },
        });

      // Return user info only (no tokens - user must login separately)
      return {
        user,
        message: 'User registered successfully. Please login to get access tokens.',
      };
    } catch (error) {
      // If auth creation fails after user creation, try to clean up user
      // This is a best-effort cleanup (compensating action)
      try {
        await this.userServiceClient.deleteUser(user.id);
      } catch (cleanupError) {
        // Log but don't throw - the original error is more important
        console.error(`Failed to cleanup user ${user.id} after auth creation failure:`, cleanupError);
      }
      throw error;
    }
  }
}
