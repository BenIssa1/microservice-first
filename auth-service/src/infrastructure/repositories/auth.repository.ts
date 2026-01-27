import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../domain/entities/auth.entity';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(Auth)
    private readonly repository: Repository<Auth>,
  ) {}

  async create(authData: Partial<Auth>): Promise<Auth> {
    const auth = this.repository.create(authData);
    return await this.repository.save(auth);
  }

  async findByUserId(userId: number): Promise<Auth | null> {
    return await this.repository.findOne({ where: { user_id: userId } });
  }

  async findByEmail(email: string): Promise<Auth | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async update(userId: number, authData: Partial<Auth>): Promise<Auth> {
    await this.repository.update({ user_id: userId }, authData);
    const updatedAuth = await this.findByUserId(userId);
    if (!updatedAuth) {
      throw new Error('Auth not found after update');
    }
    return updatedAuth;
  }

  async delete(userId: number): Promise<void> {
    await this.repository.delete({ user_id: userId });
  }
}
