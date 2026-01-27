import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles('user', 'admin')
  @Get()
  @ApiOperation({ summary: 'Get all notifications', description: 'Retrieve a list of all notifications, optionally filtered by user ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter notifications by user ID' })
  @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully' })
  findAll(@Query('userId') userId?: string, @CurrentUser() user?: any) {
    // Users can only see their own notifications, admins can see all
    const filterUserId = user?.role === 'admin' ? (userId ? +userId : undefined) : user?.userId;
    return this.notificationService.findAll(filterUserId);
  }

  @Roles('user', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID', description: 'Retrieve a specific notification by its ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new notification', description: 'Create a new notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }
}
