import { Injectable } from '@nestjs/common';
import { OutboxEvent } from '../entities/outbox.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { IOutboxRepository } from '../contracts/outbox.contracts';

@Injectable()
export class OutboxRepository
  extends Repository<OutboxEvent>
  implements IOutboxRepository
{
  constructor(
    @InjectRepository(OutboxEvent, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<OutboxEvent>,
  ) {
    super(OutboxEvent, dataAccess.manager, dataAccess.queryRunner);
  }

  async save(outboxEvent: OutboxEvent): Promise<void> {
    await this.save(outboxEvent);
  }
}
