import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class HotelEventsController {
  @EventPattern('room.availability.check')
  handleRoomAvailabilityCheck(payload: unknown) {
    console.log('Room availability check:', payload);
  }
}
