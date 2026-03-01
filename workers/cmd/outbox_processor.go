package main

import (
	"context"
	"sync"
	"workers/internal/config"
	"workers/internal/services"
	"workers/internal/store"

	"go.uber.org/zap"
)

type OutboxProcessor struct {
	store          *store.Store
	logger         *zap.Logger
	config         config.WorkerConfig
	wg             *sync.WaitGroup
	publishService *services.PublishService
}

func NewOutboxProcessor(store *store.Store, config config.WorkerConfig, logger *zap.Logger) *OutboxProcessor {
	return &OutboxProcessor{
		store:          store,
		config:         config,
		logger:         logger,
		wg:             &sync.WaitGroup{},
		publishService: services.NewPublishService(store, logger),
	}
}

func (p *OutboxProcessor) Run(ctx context.Context) {
	intervalProcessor := NewIntervalProcessor(IntervalProcessorParams{
		Name:        "outbox",
		Interval:    p.config.PollInterval,
		MaxInterval: p.config.PollInterval * 8,
		IdleCount:   10,
		Logger:      p.logger,
		Handler:     p.processBatch,
	})
	intervalProcessor.Process(ctx)
}

func (p *OutboxProcessor) processBatch(ctx context.Context) (int, error) {
	err := p.publishService.Process(ctx)
	if err != nil {
		return 0, err
	}
	return 0, nil
}
