import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IHotelRepository } from '../../../domain/repositories/hotel.repository.interface';

@Injectable()
export class DeleteHotelUseCase {
  constructor(
    @Inject('IHotelRepository')
    private readonly hotelRepository: IHotelRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    await this.hotelRepository.delete(id);
  }
}
