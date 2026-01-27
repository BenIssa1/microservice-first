import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class HotelService {
  private readonly hotelServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.hotelServiceUrl = this.configService.get<string>('HOTEL_SERVICE_URL') || 'http://localhost:3001';
  }

  async findAll(city?: string) {
    try {
      const url = city 
        ? `${this.hotelServiceUrl}/hotels?city=${city}`
        : `${this.hotelServiceUrl}/hotels`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch hotels',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.hotelServiceUrl}/hotels/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Hotel not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(createHotelDto: CreateHotelDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.hotelServiceUrl}/hotels`, createHotelDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create hotel',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateHotelDto: UpdateHotelDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.hotelServiceUrl}/hotels/${id}`, updateHotelDto),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to update hotel',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.hotelServiceUrl}/hotels/${id}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to delete hotel',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRooms(hotelId: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.hotelServiceUrl}/hotels/${hotelId}/rooms`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch rooms',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createRoom(hotelId: number, createRoomDto: CreateRoomDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.hotelServiceUrl}/hotels/${hotelId}/rooms`,
          createRoomDto,
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create room',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRoom(hotelId: number, roomId: number, updateRoomDto: UpdateRoomDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.hotelServiceUrl}/hotels/${hotelId}/rooms/${roomId}`,
          updateRoomDto,
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to update room',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRoom(hotelId: number, roomId: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.hotelServiceUrl}/hotels/${hotelId}/rooms/${roomId}`,
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to delete room',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
