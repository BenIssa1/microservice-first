import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../../domain/entities/room.entity';
import { Hotel } from '../../domain/entities/hotel.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';
import { HotelRepository } from '../../infrastructure/repositories/hotel.repository';
import { CreateRoomUseCase } from '../../application/use-cases/room/create-room.use-case';
import { GetRoomsByHotelUseCase } from '../../application/use-cases/room/get-rooms-by-hotel.use-case';
import { UpdateRoomUseCase } from '../../application/use-cases/room/update-room.use-case';
import { DeleteRoomUseCase } from '../../application/use-cases/room/delete-room.use-case';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Hotel]), RabbitMQModule, AuthModule],
  controllers: [RoomController],
  providers: [
    RoomService,
    RoomRepository,
    HotelRepository,
    {
      provide: 'IRoomRepository',
      useClass: RoomRepository,
    },
    {
      provide: 'IHotelRepository',
      useClass: HotelRepository,
    },
    CreateRoomUseCase,
    GetRoomsByHotelUseCase,
    UpdateRoomUseCase,
    DeleteRoomUseCase,
  ],
})
export class RoomModule {}
