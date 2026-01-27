import { Injectable, Inject } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository.interface';
import { Room } from '../../../domain/entities/room.entity';

@Injectable()
export class GetRoomsByHotelUseCase {
  constructor(
    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(hotelId: number): Promise<Room[]> {
    return await this.roomRepository.findByHotelId(hotelId);
  }
}
