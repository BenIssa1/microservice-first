import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IHotelRepository } from '../../../domain/repositories/hotel.repository.interface';
import { Hotel } from '../../../domain/entities/hotel.entity';

@Injectable()
export class GetHotelByIdUseCase {
  constructor(
    @Inject('IHotelRepository')
    private readonly hotelRepository: IHotelRepository,
  ) {}

  async execute(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
  }
}
