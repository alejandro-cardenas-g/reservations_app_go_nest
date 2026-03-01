package store

import (
	"context"
	"time"
)

type ReservationsRepository struct {
	dbx DBTX
}

func NewReservationsRepository(dbx DBTX) *ReservationsRepository {
	return &ReservationsRepository{dbx: dbx}
}

func (r *ReservationsRepository) ExpireReservations(ctx context.Context) (int, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `
		UPDATE reservations SET status = 'EXPIRED' where expires_at <= NOW() AND status = 'PENDING';
	`
	pgResult, err := r.dbx.Exec(ctx, query)
	if err != nil {
		return 0, err
	}

	return int(pgResult.RowsAffected()), nil
}
