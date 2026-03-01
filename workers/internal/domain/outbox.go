package domain

import (
	"encoding/json"
	"time"
)

type OutboxStatus string

const (
	OutboxStatusPending    OutboxStatus = "PENDING"
	OutboxStatusCompleted  OutboxStatus = "COMPLETED"
	OutboxStatusProcessing OutboxStatus = "PROCESSING"
	OutboxStatusFailed     OutboxStatus = "FAILED"
)

type OutboxEvent struct {
	ID            string
	AggregateType string
	AggregateID   string
	EventType     string
	Payload       json.RawMessage
	Status        OutboxStatus
	RetryCount    int
	NextRetryAt   time.Time
}
