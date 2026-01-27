import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll() {
    return this.userService.findAll();
  }

  @Roles('user', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve a specific user by its ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access own profile or admin' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Users can only see their own profile, admins can see any
    if (user?.role !== 'admin' && user?.userId !== +id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.userService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user with the provided details (Admin only). If password is provided, authentication credentials will also be created.' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles('user', 'admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update an existing user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own profile or admin' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    // Users can only update their own profile, admins can update any
    if (user?.role !== 'admin' && user?.userId !== +id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.userService.update(+id, updateUserDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
