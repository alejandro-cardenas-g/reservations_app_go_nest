import { EntityManager } from 'typeorm';
import { OutboxEvent } from '../entities/outbox.entity';
import {
  CreateOutboxCommand,
  IOutboxRepository,
} from '../contracts/outbox.contracts';

export class OutboxRepositoryCreator implements IOutboxRepository {
  private constructor(private readonly manager: EntityManager) {}

  public static Create(manager: EntityManager): IOutboxRepository {
    return new OutboxRepositoryCreator(manager);
  }

  async publish(command: CreateOutboxCommand): Promise<void> {
    const repo = this.manager.getRepository(OutboxEvent);
    await repo.save(
      repo.create({
        ...command,
        status: 'PENDING',
        retryCount: 0,
        publishedAt: new Date(),
      }),
    );
  }
}
