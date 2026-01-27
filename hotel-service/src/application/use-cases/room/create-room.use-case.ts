import { Injectable, Inject } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository.interface';
import { IHotelRepository } from '../../../domain/repositories/hotel.repository.interface';
import { Room } from '../../../domain/entities/room.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,
    @Inject('IHotelRepository')
    private readonly hotelRepository: IHotelRepository,
  ) {}

  async execute(roomData: Partial<Room>): Promise<Room> {
    const hotel = await this.hotelRepository.findById(roomData.hotel_id);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${roomData.hotel_id} not found`);
    }
    return await this.roomRepository.create(roomData);
  }
}
