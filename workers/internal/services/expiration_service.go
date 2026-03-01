package services

import (
	"context"
	"workers/internal/store"

	"go.uber.org/zap"
)

type ExpirationService struct {
	logger                 *zap.Logger
	reservationsRepository *store.ReservationsRepository
}

func NewExpirationService(store *store.Store, logger *zap.Logger) *ExpirationService {
	return &ExpirationService{reservationsRepository: store.Reservations, logger: logger}
}

func (s *ExpirationService) Process(ctx context.Context) error {
	expiredReservations, err := s.reservationsRepository.ExpireReservations(ctx)
	if err != nil {
		s.logger.Error("failed to expire reservations", zap.Error(err))
		return err
	}

	if expiredReservations != 0 {
		s.logger.Info("expired reservations", zap.Int("expiredReservations", expiredReservations))
	}

	return nil
}
