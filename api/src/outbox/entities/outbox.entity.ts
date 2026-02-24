import { AuditableEntity } from '@app/common/database/auditableEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OutboxStatus } from '../types/outboxStatus';

@Entity({
  name: 'outbox_events',
})
export class OutboxEvent extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    name: 'name',
    length: 50,
    nullable: false,
  })
  aggregateType: string;

  @Column('uuid', {
    name: 'aggregate_id',
    nullable: false,
  })
  aggregateId: string;

  @Column('character varying', {
    name: 'event_type',
    length: 50,
    nullable: false,
  })
  eventType: string;

  @Column('jsonb', {
    name: 'payload',
    nullable: false,
  })
  payload: Record<string, unknown>;

  @Column('character varying', {
    name: 'status',
    length: 20,
    nullable: false,
  })
  status: OutboxStatus;

  @Column('integer', {
    name: 'retry_count',
    nullable: false,
    default: 0,
  })
  retryCount: number;

  @Column('timestamp', {
    name: 'published_at',
    nullable: true,
  })
  publishedAt: Date;
}
