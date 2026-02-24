import { AuditableEntity } from '@app/common/database/auditableEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './locations.entity';

@Entity({
  name: 'hotels',
})
export class Hotel extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    name: 'name',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column('integer', {
    name: 'location_id',
    nullable: false,
  })
  locationId: number;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
