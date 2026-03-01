package services

import (
	"context"
	"errors"
	"fmt"
	"time"
	"workers/internal/domain"
	"workers/internal/store"

	"go.uber.org/zap"
)

const MAX_RETRY_COUNT = 3

type PublishService struct {
	outbox    *store.OutboxRepository
	txManager *store.TxManager
	logger    *zap.Logger
}

func NewPublishService(store *store.Store, logger *zap.Logger) *PublishService {
	return &PublishService{outbox: store.Outbox, txManager: store.TxManager, logger: logger}
}

func (s *PublishService) Process(ctx context.Context) error {

	var events []domain.OutboxEvent

	err := s.txManager.WithTx(ctx, func(tx store.DBTX) error {
		repoTx := store.NewOutboxRepository(tx)
		eventsTx, err := repoTx.GetPendingEvents(ctx)
		if err != nil {
			s.logger.Error("failed to get pending events", zap.Error(err))
			return err
		}
		if len(eventsTx) == 0 {
			return nil
		}

		ids := make([]string, len(eventsTx))
		for i, event := range eventsTx {
			ids[i] = event.ID
		}

		err = repoTx.SetProcessingByIds(ctx, ids)
		if err != nil {
			s.logger.Error("failed to set processing status", zap.Error(err))
			return err
		}

		events = eventsTx
		return nil
	})

	if err != nil {
		s.logger.Error("failed to get pending events", zap.Error(err))
		return err
	}

	if len(events) == 0 {
		return nil
	}

	for _, event := range events {
		s.processEvent(ctx, event)
	}

	return nil
}

func (s *PublishService) processEvent(ctx context.Context, event domain.OutboxEvent) {
	var err error
	if event.EventType == "error_event" {
		err = errors.New("error_event")
	}
	fmt.Println("sending event to queue", event.ID)
	time.Sleep(3 * time.Second)

	if err != nil {
		if event.RetryCount+1 > MAX_RETRY_COUNT {
			s.outbox.SetFailedById(ctx, event.ID)
			s.logger.Info("event failed", zap.String("event_id", event.ID), zap.String("reasons", "max retries reached"))
			return
		}
		s.outbox.SetPendingById(ctx, event.ID)
		return
	}

	s.logger.Info("event completed", zap.String("event_id", event.ID))
	s.outbox.SetCompletedById(ctx, event.ID)
}
