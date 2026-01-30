import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateHotelUseCase } from '../../application/use-cases/hotel/create-hotel.use-case';
import { GetAllHotelsUseCase } from '../../application/use-cases/hotel/get-all-hotels.use-case';
import { GetHotelByIdUseCase } from '../../application/use-cases/hotel/get-hotel-by-id.use-case';
import { UpdateHotelUseCase } from '../../application/use-cases/hotel/update-hotel.use-case';
import { DeleteHotelUseCase } from '../../application/use-cases/hotel/delete-hotel.use-case';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelService {
  constructor(
    private readonly createHotelUseCase: CreateHotelUseCase,
    private readonly getAllHotelsUseCase: GetAllHotelsUseCase,
    private readonly getHotelByIdUseCase: GetHotelByIdUseCase,
    private readonly updateHotelUseCase: UpdateHotelUseCase,
    private readonly deleteHotelUseCase: DeleteHotelUseCase,
    @Inject('HOTEL_EVENTS_SERVICE') private readonly hotelEventsClient: ClientProxy,
  ) {}

  async findAll(city?: string) {
    return await this.getAllHotelsUseCase.execute(city);
  }

  async findOne(id: number) {
    return await this.getHotelByIdUseCase.execute(id);
  }

  async create(createHotelDto: CreateHotelDto) {
    const hotel = await this.createHotelUseCase.execute(createHotelDto);
    this.hotelEventsClient.emit('hotel.created', {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
    }).subscribe();
    return hotel;
  }

  async update(id: number, updateHotelDto: UpdateHotelDto) {
    const hotel = await this.updateHotelUseCase.execute(id, updateHotelDto);
    this.hotelEventsClient.emit('hotel.updated', {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
    }).subscribe();
    return hotel;
  }

  async remove(id: number) {
    await this.deleteHotelUseCase.execute(id);
  }
}
