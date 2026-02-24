import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../../hotels/entities/room.entity';
import { ReservationStatus } from '../types/reservation-status';

@Entity({
  name: 'reservations',
})
export class Reservation {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('uuid', {
    name: 'room_id',
    nullable: false,
  })
  roomId: string;

  @Column('uuid', {
    name: 'guest_id',
    nullable: false,
  })
  guestId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
    enumName: 'reservation_status',
    default: 'PENDING',
  })
  status: ReservationStatus;

  @Column('date', {
    name: 'check_in',
    nullable: false,
  })
  checkIn: Date;

  @Column('date', {
    name: 'check_out',
    nullable: false,
  })
  checkOut: Date;

  @Column('timestamp', {
    name: 'expires_at',
    nullable: false,
  })
  expiresAt: Date;

  @Column('timestamp', {
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updated_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Room, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'room_id' })
  room: Room;
}
