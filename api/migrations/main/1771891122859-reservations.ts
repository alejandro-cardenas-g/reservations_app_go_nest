import { MigrationInterface, QueryRunner } from 'typeorm';

export class Reservations1771891122859 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS public.locations (
              id  SERIAL NOT NULL,
              name VARCHAR(255) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT NOW(),
              CONSTRAINT "PK_location_id" PRIMARY KEY (id)
          );`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS public.hotels (
            id  UUID NOT NULL DEFAULT uuidv7(),
            name VARCHAR(255) NOT NULL,
            location_id INTEGER NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT "PK_hotel_id" PRIMARY KEY (id),
            CONSTRAINT "FK_hotel_location_id" FOREIGN KEY (location_id) REFERENCES locations(id)
        );`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS public.rooms (
            id  UUID NOT NULL DEFAULT uuidv7(),
            hotel_id UUID NOT NULL,
            room_number VARCHAR(20) NOT NULL,
            type VARCHAR(10) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT "PK_room_id" PRIMARY KEY (id),
            CONSTRAINT "FK_room_hotel_id" FOREIGN KEY (hotel_id) REFERENCES hotels(id)
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_room_hotel_id_room_number ON public.rooms(hotel_id, room_number);
        `,
    );

    await queryRunner.query(`
        CREATE TYPE reservation_status AS ENUM (
            'PENDING',
            'CONFIRMED',
            'CANCELLED',
            'EXPIRED'
        );

        CREATE TABLE IF NOT EXISTS public.reservations (
            id  UUID NOT NULL DEFAULT uuidv7(),
            room_id UUID NOT NULL,
            guest_id UUID NOT NULL,
            status reservation_status NOT NULL DEFAULT 'PENDING',
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT "PK_reservation_id" PRIMARY KEY (id),
            CONSTRAINT "FK_reservation_room_id" FOREIGN KEY (room_id) REFERENCES rooms(id),
            CONSTRAINT "CK_check_out_greater_than_check_in" CHECK (check_out > check_in)
        );

        CREATE INDEX IF NOT EXISTS idx_reservation_room ON reservations(room_id);
        CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservations(status);
        CREATE INDEX IF NOT EXISTS idx_reservation_expiration ON reservations(expires_at);
        CREATE INDEX IF NOT EXISTS idx_reservation_guest_status_id_desc ON reservations (guest_id, status, id DESC);
    `);

    await queryRunner.query(`
        CREATE EXTENSION IF NOT EXISTS btree_gist;
        ALTER TABLE public.reservations
            ADD CONSTRAINT CK_no_overlapping_reservations
            EXCLUDE USING GIST (
                room_id WITH =,
                daterange(check_in, check_out, '[]') WITH &&
            )
        WHERE (status IN ('PENDING', 'CONFIRMED'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_reservation_room;
    `);
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_reservation_status;
    `);
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_reservation_expiration;
    `);

    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_unique_room_hotel_id_room_number;
    `);

    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_reservation_guest_status_id_desc;
    `);

    await queryRunner.query(`
        ALTER TABLE public.hotels DROP CONSTRAINT IF EXISTS "FK_hotel_location_id";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS public.locations;
    `);

    await queryRunner.query(`
        ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS "CK_no_overlapping_reservations";
    `);

    await queryRunner.query(`
         ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS "CK_check_out_greater_than_check_in";
    `);
    await queryRunner.query(`
         ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS "FK_reservation_room_id";
    `);
    await queryRunner.query(`
         ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS "FK_room_hotel_id";
    `);
    await queryRunner.query(`
        ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS "PK_room_id";
    `);
    await queryRunner.query(`
        ALTER TABLE public.hotels DROP CONSTRAINT IF EXISTS "PK_hotel_id";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS public.hotels;
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS public.rooms;
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS public.reservations;
    `);
    await queryRunner.query(`
        DROP TYPE IF EXISTS reservation_status;
    `);
  }
}
