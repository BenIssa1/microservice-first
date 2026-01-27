import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository.interface';
import { Room } from '../../../domain/entities/room.entity';

@Injectable()
export class UpdateRoomUseCase {
  constructor(
    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(id: number, roomData: Partial<Room>): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return await this.roomRepository.update(id, roomData);
  }
}
