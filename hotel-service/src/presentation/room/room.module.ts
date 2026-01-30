import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Hotel]),
    ClientsModule.registerAsync([
      {
        name: 'HOTEL_EVENTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: 'hotel_events_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
  ],
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
