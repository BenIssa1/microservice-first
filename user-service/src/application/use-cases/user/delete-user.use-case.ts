import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }
}
