import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1751503434433 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."users" (  
        id uuid NOT NULL DEFAULT uuidv7(),
        email varchar NOT NULL,
        is_active bool NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_id" PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_unique_user_email ON users(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_unique_user_email;
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "public"."users";
    `);
  }
}
