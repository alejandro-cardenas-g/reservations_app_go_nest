package store

import (
	"context"
	"time"
	"workers/internal/domain"
)

type OutboxRepository struct {
	dbx DBTX
}

func NewOutboxRepository(dbx DBTX) *OutboxRepository {
	return &OutboxRepository{dbx: dbx}
}

func (r *OutboxRepository) GetPendingEvents(ctx context.Context) ([]domain.OutboxEvent, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `
		SELECT id, aggregate_type, aggregate_id, event_type, payload, status, retry_count, next_retry_at FROM outbox_events WHERE status = 'PENDING' AND next_retry_at <= NOW() LIMIT 100 FOR UPDATE SKIP LOCKED;
	`
	rows, err := r.dbx.Query(ctx, query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	events := []domain.OutboxEvent{}
	for rows.Next() {
		var event domain.OutboxEvent
		err := rows.Scan(&event.ID, &event.AggregateType, &event.AggregateID, &event.EventType, &event.Payload, &event.Status, &event.RetryCount, &event.NextRetryAt)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (r *OutboxRepository) setStatusById(ctx context.Context, id string, status domain.OutboxStatus) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `
		UPDATE outbox_events SET status = $1 WHERE id = $2;
	`
	_, err := r.dbx.Exec(ctx, query, status, id)
	return err
}

func (r *OutboxRepository) SetCompletedById(ctx context.Context, id string) error {
	return r.setStatusById(ctx, id, domain.OutboxStatusCompleted)
}

func (r *OutboxRepository) SetPendingById(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `
		UPDATE outbox_events SET status = $1, retry_count = retry_count + 1, next_retry_at = now() + INTERVAL '1 minute' WHERE id = $2;
	`
	_, err := r.dbx.Exec(ctx, query, domain.OutboxStatusPending, id)
	return err
}

func (r *OutboxRepository) SetFailedById(ctx context.Context, id string) error {
	return r.setStatusById(ctx, id, domain.OutboxStatusFailed)
}

func (r *OutboxRepository) SetProcessingByIds(ctx context.Context, ids []string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `
		UPDATE outbox_events SET status = $1 WHERE id = ANY($2);
	`
	_, err := r.dbx.Exec(ctx, query, domain.OutboxStatusProcessing, ids)
	return err
}
