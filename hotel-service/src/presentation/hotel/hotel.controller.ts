import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('hotels')
@Controller('hotels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  findAll(@Query('city') city?: string) {
    return this.hotelService.findAll(city);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelService.findOne(+id);
  }

  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelService.update(+id, updateHotelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelService.remove(+id);
  }
}
