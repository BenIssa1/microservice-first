import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../domain/entities/room.entity';
import { IRoomRepository } from '../../domain/repositories/room.repository.interface';

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>,
  ) {}

  async findAll(hotelId?: number): Promise<Room[]> {
    const queryBuilder = this.repository.createQueryBuilder('room')
      .leftJoinAndSelect('room.hotel', 'hotel');

    if (hotelId) {
      queryBuilder.where('room.hotel_id = :hotelId', { hotelId });
    }

    return await queryBuilder.getMany();
  }

  async findById(id: number): Promise<Room | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['hotel'],
    });
  }

  async findByHotelId(hotelId: number): Promise<Room[]> {
    return await this.repository.find({
      where: { hotel_id: hotelId },
      relations: ['hotel'],
    });
  }

  async create(room: Partial<Room>): Promise<Room> {
    const newRoom = this.repository.create(room);
    return await this.repository.save(newRoom);
  }

  async update(id: number, room: Partial<Room>): Promise<Room> {
    await this.repository.update(id, room);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async updateAvailability(id: number, available: boolean): Promise<Room> {
    await this.repository.update(id, { available });
    return await this.findById(id);
  }
}
