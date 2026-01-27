import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

@Module({
  imports: [HttpModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
