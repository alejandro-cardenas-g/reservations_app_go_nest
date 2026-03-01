package main

import (
	"context"
	"fmt"
	"sync"
	"time"
	"workers/internal/config"
	"workers/internal/store"

	"go.uber.org/zap"
)

type OutboxProcessor struct {
	store  *store.Store
	logger *zap.Logger
	config config.WorkerConfig
	wg     *sync.WaitGroup
}

func NewOutboxProcessor(store *store.Store, config config.WorkerConfig, logger *zap.Logger) *OutboxProcessor {
	return &OutboxProcessor{
		store:  store,
		config: config,
		logger: logger,
		wg:     &sync.WaitGroup{},
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
	fmt.Println("Processing batch")
	time.Sleep(3 * time.Second)
	fmt.Println("Batch processed")
	return 0, nil
}
