import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../../domain/entities/hotel.entity';
import { IHotelRepository } from '../../domain/repositories/hotel.repository.interface';

@Injectable()
export class HotelRepository implements IHotelRepository {
  constructor(
    @InjectRepository(Hotel)
    private readonly repository: Repository<Hotel>,
  ) {}

  async findAll(city?: string): Promise<Hotel[]> {
    const queryBuilder = this.repository.createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'rooms')
      .where('hotel.is_active = :isActive', { isActive: true });

    if (city) {
      queryBuilder.andWhere('hotel.city = :city', { city });
    }

    return await queryBuilder.getMany();
  }

  async findById(id: number): Promise<Hotel | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['rooms'],
    });
  }

  async create(hotel: Partial<Hotel>): Promise<Hotel> {
    const newHotel = this.repository.create(hotel);
    return await this.repository.save(newHotel);
  }

  async update(id: number, hotel: Partial<Hotel>): Promise<Hotel> {
    await this.repository.update(id, hotel);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
