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

type ExpirationProcessor struct {
	store  *store.Store
	logger *zap.Logger
	config config.WorkerConfig
	wg     *sync.WaitGroup
}

func NewExpirationProcessor(store *store.Store, config config.WorkerConfig, logger *zap.Logger) *ExpirationProcessor {
	return &ExpirationProcessor{
		store:  store,
		config: config,
		logger: logger,
		wg:     &sync.WaitGroup{},
	}
}

func (p *ExpirationProcessor) Run(ctx context.Context) {
	intervalProcessor := NewIntervalProcessor(IntervalProcessorParams{
		Name:        "expiration",
		Interval:    time.Second * 5,
		MaxInterval: time.Second * 60,
		IdleCount:   10,
		Logger:      p.logger,
		Handler:     p.processBatch,
	})
	intervalProcessor.Process(ctx)
}

func (p *ExpirationProcessor) processBatch(ctx context.Context) (int, error) {
	fmt.Println("Processing batche expiration")
	time.Sleep(2 * time.Second)
	fmt.Println("Batch processed expiration")
	return 0, nil
}
