import { Room } from '../entities/room.entity';

export interface IRoomRepository {
  findAll(hotelId?: number): Promise<Room[]>;
  findById(id: number): Promise<Room | null>;
  findByHotelId(hotelId: number): Promise<Room[]>;
  create(room: Partial<Room>): Promise<Room>;
  update(id: number, room: Partial<Room>): Promise<Room>;
  delete(id: number): Promise<void>;
  updateAvailability(id: number, available: boolean): Promise<Room>;
}
