import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Internal } from '../../auth/decorators/internal.decorator';

@ApiTags('rooms')
@Controller('hotels/:hotelId/rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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

  @Internal()
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
