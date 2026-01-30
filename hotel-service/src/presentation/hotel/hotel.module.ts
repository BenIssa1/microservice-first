import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Hotel } from '../../domain/entities/hotel.entity';
import { HotelController } from './hotel.controller';
import { HotelEventsController } from './hotel-events.controller';
import { HotelService } from './hotel.service';
import { HotelRepository } from '../../infrastructure/repositories/hotel.repository';
import { CreateHotelUseCase } from '../../application/use-cases/hotel/create-hotel.use-case';
import { GetAllHotelsUseCase } from '../../application/use-cases/hotel/get-all-hotels.use-case';
import { GetHotelByIdUseCase } from '../../application/use-cases/hotel/get-hotel-by-id.use-case';
import { UpdateHotelUseCase } from '../../application/use-cases/hotel/update-hotel.use-case';
import { DeleteHotelUseCase } from '../../application/use-cases/hotel/delete-hotel.use-case';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel]),
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
  controllers: [HotelController, HotelEventsController],
  providers: [
    HotelService,
    HotelRepository,
    {
      provide: 'IHotelRepository',
      useClass: HotelRepository,
    },
    CreateHotelUseCase,
    GetAllHotelsUseCase,
    GetHotelByIdUseCase,
    UpdateHotelUseCase,
    DeleteHotelUseCase,
  ],
})
export class HotelModule {}
