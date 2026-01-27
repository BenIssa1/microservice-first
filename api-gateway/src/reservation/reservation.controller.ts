import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get all reservations', description: 'Retrieve a list of all reservations, optionally filtered by user ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter reservations by user ID' })
  @ApiResponse({ status: 200, description: 'List of reservations retrieved successfully' })
  findAll(@Query('userId') userId?: string, @CurrentUser() user?: any) {
    // Users can only see their own reservations, admins can see all
    const filterUserId = user?.role === 'admin' ? (userId ? +userId : undefined) : user?.userId;
    return this.reservationService.findAll(filterUserId);
  }

  @Roles('user', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID', description: 'Retrieve a specific reservation by its ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(+id);
  }

  @Roles('user', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a new reservation', description: 'Create a new reservation with the provided details' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createReservationDto: CreateReservationDto, @CurrentUser() user: any) {
    // Set user_id from authenticated user
    createReservationDto.user_id = user.userId;
    return this.reservationService.create(createReservationDto);
  }

  @Roles('user', 'admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update reservation', description: 'Update an existing reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(+id, updateReservationDto);
  }

  @Roles('user', 'admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel reservation', description: 'Cancel a reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  cancel(@Param('id') id: string) {
    return this.reservationService.cancel(+id);
  }
}
