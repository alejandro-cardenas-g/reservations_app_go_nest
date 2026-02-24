import { AuditableEntity } from '@app/common/database/auditableEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'sessions',
})
export class Session extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    name: 'audience',
    nullable: false,
  })
  audience: string;

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string;

  @Column('time without time zone', {
    name: 'expire_at',
    nullable: false,
  })
  expireAt: Date;
}
