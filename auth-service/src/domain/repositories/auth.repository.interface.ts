import { Auth } from '../entities/auth.entity';

export interface IAuthRepository {
  create(authData: Partial<Auth>): Promise<Auth>;
  findByUserId(userId: number): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  update(userId: number, authData: Partial<Auth>): Promise<Auth>;
  delete(userId: number): Promise<void>;
}
