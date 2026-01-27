import { Injectable } from '@nestjs/common';
import { CreateHotelUseCase } from '../../application/use-cases/hotel/create-hotel.use-case';
import { GetAllHotelsUseCase } from '../../application/use-cases/hotel/get-all-hotels.use-case';
import { GetHotelByIdUseCase } from '../../application/use-cases/hotel/get-hotel-by-id.use-case';
import { UpdateHotelUseCase } from '../../application/use-cases/hotel/update-hotel.use-case';
import { DeleteHotelUseCase } from '../../application/use-cases/hotel/delete-hotel.use-case';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class HotelService {
  constructor(
    private readonly createHotelUseCase: CreateHotelUseCase,
    private readonly getAllHotelsUseCase: GetAllHotelsUseCase,
    private readonly getHotelByIdUseCase: GetHotelByIdUseCase,
    private readonly updateHotelUseCase: UpdateHotelUseCase,
    private readonly deleteHotelUseCase: DeleteHotelUseCase,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async findAll(city?: string) {
    return await this.getAllHotelsUseCase.execute(city);
  }

  async findOne(id: number) {
    return await this.getHotelByIdUseCase.execute(id);
  }

  async create(createHotelDto: CreateHotelDto) {
    const hotel = await this.createHotelUseCase.execute(createHotelDto);
    await this.rabbitMQService.sendToQueue('hotel.created', {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
    });
    return hotel;
  }

  async update(id: number, updateHotelDto: UpdateHotelDto) {
    const hotel = await this.updateHotelUseCase.execute(id, updateHotelDto);
    await this.rabbitMQService.sendToQueue('hotel.updated', {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
    });
    return hotel;
  }

  async remove(id: number) {
    await this.deleteHotelUseCase.execute(id);
  }
}
