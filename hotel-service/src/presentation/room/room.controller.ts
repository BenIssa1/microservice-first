import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('hotels/:hotelId/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  findAll(@Param('hotelId') hotelId: string) {
    return this.roomService.findAll(+hotelId);
  }

  @Post()
  create(@Param('hotelId') hotelId: string, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(+hotelId, createRoomDto);
  }

  @Put(':id')
  update(
    @Param('hotelId') hotelId: string,
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
