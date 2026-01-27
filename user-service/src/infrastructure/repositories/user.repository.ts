import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.repository.update(id, userData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
