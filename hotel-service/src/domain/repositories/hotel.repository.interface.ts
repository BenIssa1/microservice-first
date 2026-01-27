import { Hotel } from '../entities/hotel.entity';

export interface IHotelRepository {
  findAll(city?: string): Promise<Hotel[]>;
  findById(id: number): Promise<Hotel | null>;
  create(hotel: Partial<Hotel>): Promise<Hotel>;
  update(id: number, hotel: Partial<Hotel>): Promise<Hotel>;
  delete(id: number): Promise<void>;
}
