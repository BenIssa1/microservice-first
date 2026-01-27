import { Injectable, Inject } from '@nestjs/common';
import { IHotelRepository } from '../../../domain/repositories/hotel.repository.interface';
import { Hotel } from '../../../domain/entities/hotel.entity';

@Injectable()
export class CreateHotelUseCase {
  constructor(
    @Inject('IHotelRepository')
    private readonly hotelRepository: IHotelRepository,
  ) {}

  async execute(hotelData: Partial<Hotel>): Promise<Hotel> {
    return await this.hotelRepository.create(hotelData);
  }
}
