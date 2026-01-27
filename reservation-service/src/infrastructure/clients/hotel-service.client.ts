import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HotelServiceClient {
  private readonly hotelServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.hotelServiceUrl = this.configService.get<string>('HOTEL_SERVICE_URL') || 'http://localhost:3001';
  }

  async getRoom(roomId: number): Promise<any> {
    try {
      // This is a simplified version - in a real scenario, you'd need an endpoint to get room by ID
      const response = await firstValueFrom(
        this.httpService.get(`${this.hotelServiceUrl}/hotels/1/rooms/${roomId}`),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching room:', error);
      return null;
    }
  }

  async updateRoomAvailability(roomId: number, available: boolean): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.put(`${this.hotelServiceUrl}/hotels/1/rooms/${roomId}`, {
          available,
        }),
      );
    } catch (error) {
      console.error('Error updating room availability:', error);
    }
  }
}
