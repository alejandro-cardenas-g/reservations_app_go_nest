import { AuditableEntity } from '@app/common/database/auditableEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    name: 'email',
    nullable: false,
  })
  email: string;

  @Column('boolean', {
    name: 'is_active',
    nullable: false,
  })
  isActive: boolean;
}
