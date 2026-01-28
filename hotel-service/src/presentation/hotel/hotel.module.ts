import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from '../../domain/entities/hotel.entity';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { HotelRepository } from '../../infrastructure/repositories/hotel.repository';
import { CreateHotelUseCase } from '../../application/use-cases/hotel/create-hotel.use-case';
import { GetAllHotelsUseCase } from '../../application/use-cases/hotel/get-all-hotels.use-case';
import { GetHotelByIdUseCase } from '../../application/use-cases/hotel/get-hotel-by-id.use-case';
import { UpdateHotelUseCase } from '../../application/use-cases/hotel/update-hotel.use-case';
import { DeleteHotelUseCase } from '../../application/use-cases/hotel/delete-hotel.use-case';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel]), RabbitMQModule, AuthModule],
  controllers: [HotelController],
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
