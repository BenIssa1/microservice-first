import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  @Index()
  user_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refresh_token: string;

  @Column({ type: 'timestamp', nullable: true })
  refresh_token_expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
