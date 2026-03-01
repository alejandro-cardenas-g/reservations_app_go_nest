package main

import (
	"context"
	"sync"
	"time"
	"workers/internal/config"
	"workers/internal/services"
	"workers/internal/store"

	"go.uber.org/zap"
)

type ExpirationProcessor struct {
	store             *store.Store
	logger            *zap.Logger
	config            config.WorkerConfig
	wg                *sync.WaitGroup
	expirationService *services.ExpirationService
}

func NewExpirationProcessor(store *store.Store, config config.WorkerConfig, logger *zap.Logger) *ExpirationProcessor {
	return &ExpirationProcessor{
		store:             store,
		config:            config,
		logger:            logger,
		wg:                &sync.WaitGroup{},
		expirationService: services.NewExpirationService(store, logger),
	}
}

func (p *ExpirationProcessor) Run(ctx context.Context) {
	intervalProcessor := NewIntervalProcessor(IntervalProcessorParams{
		Name:        "expiration",
		Interval:    time.Second * 30,
		MaxInterval: time.Second * 60 * 2,
		IdleCount:   10,
		Logger:      p.logger,
		Handler:     p.processBatch,
	})
	intervalProcessor.Process(ctx)
}

func (p *ExpirationProcessor) processBatch(ctx context.Context) (int, error) {
	err := p.expirationService.Process(ctx)
	if err != nil {
		return 0, err
	}
	return 0, nil
}
