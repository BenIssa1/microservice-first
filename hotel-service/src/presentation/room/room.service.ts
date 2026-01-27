import { Injectable } from '@nestjs/common';
import { CreateRoomUseCase } from '../../application/use-cases/room/create-room.use-case';
import { GetRoomsByHotelUseCase } from '../../application/use-cases/room/get-rooms-by-hotel.use-case';
import { UpdateRoomUseCase } from '../../application/use-cases/room/update-room.use-case';
import { DeleteRoomUseCase } from '../../application/use-cases/room/delete-room.use-case';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly getRoomsByHotelUseCase: GetRoomsByHotelUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async findAll(hotelId: number) {
    return await this.getRoomsByHotelUseCase.execute(hotelId);
  }

  async create(hotelId: number, createRoomDto: CreateRoomDto) {
    const room = await this.createRoomUseCase.execute({
      ...createRoomDto,
      hotel_id: hotelId,
    });
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const room = await this.updateRoomUseCase.execute(id, updateRoomDto);
    // Check if available property was updated
    if ('available' in updateRoomDto && updateRoomDto.available !== undefined) {
      await this.rabbitMQService.sendToQueue('room.availability.update', {
        roomId: room.id,
        hotelId: room.hotel_id,
        available: room.available,
      });
    }
    return room;
  }

  async remove(id: number) {
    await this.deleteRoomUseCase.execute(id);
  }
}
