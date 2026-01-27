import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  imports: [HttpModule],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
