package main

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"
)

type IntervalProcessor struct {
	name         string
	interval     time.Duration
	maxInterval  time.Duration
	idleCountMax int
	logger       *zap.Logger
	handler      func(ctx context.Context) (int, error)
}

type IntervalProcessorParams struct {
	Name        string
	Interval    time.Duration
	MaxInterval time.Duration
	IdleCount   int
	Logger      *zap.Logger
	Handler     func(ctx context.Context) (int, error)
}

func NewIntervalProcessor(params IntervalProcessorParams) *IntervalProcessor {
	return &IntervalProcessor{
		name:         params.Name,
		interval:     params.Interval,
		maxInterval:  params.MaxInterval,
		idleCountMax: max(params.IdleCount, 1),
		logger:       params.Logger,
		handler:      params.Handler,
	}
}

func (p *IntervalProcessor) Process(ctx context.Context) {
	interval := p.interval
	idleCount := 0

	for {
		select {
		case <-ctx.Done():
			p.logger.Sugar().Infof("%v processor shutting down", p.name)
			return
		default:
		}

		processedItems, err := p.handler(ctx)
		if err != nil {
			p.logger.Error(fmt.Sprintf("error processing batch at %v processor", p.name), zap.Error(err))
		}

		// exponential backoff logic
		if processedItems == 0 {
			idleCount++
			if idleCount > p.idleCountMax {
				interval *= 2
				if interval > p.maxInterval {
					interval = p.maxInterval
				}
				idleCount = 0
			}
		} else {
			interval = p.interval
			idleCount = 0
		}

		select {
		case <-ctx.Done():
			p.logger.Sugar().Infof("%v processor stopped during sleep", p.name)
			return
		case <-time.After(interval):
		}
	}
}
