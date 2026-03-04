import { Pool } from "pg";

export class ReservationsRepository {
  constructor(private readonly pool: Pool) {}

  async getReservation(reservationId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM reservations WHERE id = $1",
        [reservationId],
      );
    } finally {
      client.release();
    }
  }
}
