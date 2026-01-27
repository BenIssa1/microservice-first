import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('hotels')
@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Roles('user', 'admin')
  @Get()
  @ApiOperation({ summary: 'Get all hotels', description: 'Retrieve a list of all hotels, optionally filtered by city' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter hotels by city' })
  @ApiResponse({ status: 200, description: 'List of hotels retrieved successfully' })
  findAll(@Query('city') city?: string) {
    return this.hotelService.findAll(city);
  }

  @Roles('user', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get hotel by ID', description: 'Retrieve a specific hotel by its ID' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiResponse({ status: 200, description: 'Hotel retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  findOne(@Param('id') id: string) {
    return this.hotelService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new hotel', description: 'Create a new hotel with the provided details (Admin only)' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createHotelDto: CreateHotelDto, @CurrentUser() user: any) {
    return this.hotelService.create(createHotelDto);
  }

  @Roles('admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update hotel', description: 'Update an existing hotel by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelService.update(+id, updateHotelDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete hotel', description: 'Delete a hotel by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.hotelService.remove(+id);
  }

  @Roles('user', 'admin')
  @Get(':id/rooms')
  @ApiOperation({ summary: 'Get hotel rooms', description: 'Retrieve all rooms for a specific hotel' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiResponse({ status: 200, description: 'List of rooms retrieved successfully' })
  getRooms(@Param('id') id: string) {
    return this.hotelService.getRooms(+id);
  }

  @Roles('admin')
  @Post(':id/rooms')
  @ApiOperation({ summary: 'Create a room', description: 'Create a new room for a hotel (Admin only)' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  createRoom(@Param('id') id: string, @Body() createRoomDto: CreateRoomDto) {
    return this.hotelService.createRoom(+id, createRoomDto);
  }

  @Roles('admin')
  @Put(':id/rooms/:roomId')
  @ApiOperation({ summary: 'Update room', description: 'Update an existing room (Admin only)' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiParam({ name: 'roomId', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  updateRoom(
    @Param('id') id: string,
    @Param('roomId') roomId: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.hotelService.updateRoom(+id, +roomId, updateRoomDto);
  }

  @Roles('admin')
  @Delete(':id/rooms/:roomId')
  @ApiOperation({ summary: 'Delete room', description: 'Delete a room from a hotel (Admin only)' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiParam({ name: 'roomId', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  deleteRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    return this.hotelService.deleteRoom(+id, +roomId);
  }
}
