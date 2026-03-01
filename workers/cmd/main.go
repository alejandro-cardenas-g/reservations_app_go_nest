package main

import (
	"context"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
	"workers/internal/config"
	"workers/internal/store"

	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	store := store.NewStore(cfg.Store)

	ctx, cancel := context.WithCancel(context.Background())

	wg := &sync.WaitGroup{}

	processors := []Processor{
		NewOutboxProcessor(store, cfg.Worker, logger),
		NewExpirationProcessor(store, cfg.Worker, logger),
	}

	logger.Info("Starting processors")

	wg.Add(len(processors))

	for _, processor := range processors {
		go func(processor Processor) {
			defer wg.Done()
			processor.Run(ctx)
		}(processor)
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	<-stop

	logger.Info("Shutdown signal received")

	// cancel context
	cancel()

	done := make(chan struct{})

	go func() {
		wg.Wait()
		defer close(done)
	}()

	select {
	case <-done:
		logger.Info("All processors stopped gracefully")
	case <-time.After(20 * time.Second):
		logger.Warn("Force shutdown after 20 seconds timeout")
	}

	logger.Info("Workers stopped")
}
