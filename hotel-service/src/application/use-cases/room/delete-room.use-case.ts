import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository.interface';

@Injectable()
export class DeleteRoomUseCase {
  constructor(
    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    await this.roomRepository.delete(id);
  }
}
