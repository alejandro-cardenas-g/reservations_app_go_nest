import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payments1771895119065 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE payment_status AS ENUM (
        'INITIATED',
        'SUCCESS',
        'FAILED'
        );

    CREATE TABLE IF NOT EXISTS public.payments (
        id UUID NOT NULL DEFAULT uuidv7(),
        reservation_id UUID NOT NULL,
        status payment_status NOT NULL,
        provider_reference VARCHAR(255),
        failure_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_payment_id" PRIMARY KEY (id),
        CONSTRAINT "FK_payment_reservation_id" FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.payments;
      DROP TYPE IF EXISTS payment_status;
    `);
  }
}
