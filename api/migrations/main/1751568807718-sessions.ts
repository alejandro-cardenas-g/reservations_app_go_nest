import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sessions1751568807718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."sessions" (  
        id uuid NOT NULL DEFAULT uuidv7(),
        audience varchar(50) NOT NULL,
        user_id uuid NOT NULL,
        expire_at timestamp NOT NULL DEFAULT now(),
        created_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_session_id" PRIMARY KEY (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "public"."sessions";
    `);
  }
}
