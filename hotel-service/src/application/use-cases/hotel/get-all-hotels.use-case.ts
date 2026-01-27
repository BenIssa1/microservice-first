import { Injectable, Inject } from '@nestjs/common';
import { IHotelRepository } from '../../../domain/repositories/hotel.repository.interface';
import { Hotel } from '../../../domain/entities/hotel.entity';

@Injectable()
export class GetAllHotelsUseCase {
  constructor(
    @Inject('IHotelRepository')
    private readonly hotelRepository: IHotelRepository,
  ) {}

  async execute(city?: string): Promise<Hotel[]> {
    return await this.hotelRepository.findAll(city);
  }
}
