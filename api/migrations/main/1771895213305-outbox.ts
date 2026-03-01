import { MigrationInterface, QueryRunner } from 'typeorm';

export class Outbox1771895213305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE event_status AS ENUM (
            'PENDING',
            'COMPLETED',
            'PROCESSING',
            'FAILED'
        );

        CREATE TABLE IF NOT EXISTS public.outbox_events (
            id UUID NOT NULL DEFAULT uuidv7(),
            aggregate_type VARCHAR(50) NOT NULL,
            aggregate_id UUID NOT NULL,
            event_type VARCHAR(100) NOT NULL,
            payload JSONB NOT NULL,
            status event_status NOT NULL DEFAULT 'PENDING',
            retry_count INT NOT NULL DEFAULT 0,
            next_retry_at TIMESTAMP NOT NULL DEFAULT NOW(),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT "PK_outbox_event_id" PRIMARY KEY (id)
        );

        CREATE INDEX IF NOT EXISTS idx_outbox_status ON public.outbox_events(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_outbox_status;
      DROP TABLE IF EXISTS public.outbox_events;
      DROP TYPE event_status;
    `);
  }
}
