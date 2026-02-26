import { OutboxEvent } from '../entities/outbox.entity';

export interface IOutboxRepository {
  save(outboxEvent: OutboxEvent): Promise<void>;
}
