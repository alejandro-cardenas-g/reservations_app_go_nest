import { AuditableEntity } from '@app/common/database/auditableEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'locations',
})
export class Location extends AuditableEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'id',
  })
  id: number;

  @Column('character varying', {
    name: 'name',
    length: 255,
    nullable: false,
  })
  name: string;
}
