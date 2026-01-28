import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from '../../domain/entities/idempotency-key.entity';

@Injectable()
export class IdempotencyKeyRepository {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly repository: Repository<IdempotencyKey>,
  ) {}

  async findByKey(key: string): Promise<IdempotencyKey | null> {
    const idempotencyKey = await this.repository.findOne({
      where: { key },
    });

    // Check if expired
    if (idempotencyKey && idempotencyKey.expires_at < new Date()) {
      await this.repository.delete(key);
      return null;
    }

    return idempotencyKey;
  }

  async create(key: string, reservationId: number, responseData: any, expiresInHours: number = 24): Promise<IdempotencyKey> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const idempotencyKey = this.repository.create({
      key,
      reservation_id: reservationId,
      response_data: responseData,
      expires_at: expiresAt,
    });

    return await this.repository.save(idempotencyKey);
  }

  async deleteExpired(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }

  async delete(key: string): Promise<void> {
    await this.repository.delete(key);
  }
}
