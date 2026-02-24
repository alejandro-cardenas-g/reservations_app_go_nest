import { AuditableEntity } from '@app/common/database/auditableEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('character varying', {
    name: 'location',
    length: 255,
    nullable: false,
  })
  location: string;
}
