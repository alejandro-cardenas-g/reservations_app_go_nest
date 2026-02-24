import { AuditableEntity } from '@app/common/database/auditableEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { RoomType } from '../types/room-type';

@Entity({
  name: 'rooms',
})
export class Room extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('uuid', {
    name: 'hotel_id',
    nullable: false,
  })
  hotelId: string;

  @Column('character varying', {
    name: 'room_number',
    length: 20,
    nullable: false,
  })
  roomNumber: string;

  @Column('character varying', {
    name: 'type',
    length: 10,
    nullable: false,
  })
  type: RoomType;

  @ManyToOne(() => Hotel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;
}
