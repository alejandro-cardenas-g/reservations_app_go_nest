package config

import (
	"log"
	"time"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	Env    string `env:"ENV" envDefault:"local"`
	Store  StoreConfig
	Worker WorkerConfig
	Logger LoggerConfig
}

type LoggerConfig struct {
	Level   string `env:"LOG_LEVEL" envDefault:"info"`
	Service string `env:"SERVICE_NAME" envDefault:"reservations-workers"`
}

type StoreConfig struct {
	URL             string        `env:"POSTGRES_URL,required"`
	MaxOpenConns    int           `env:"POSTGRES_MAX_OPEN_CONNS" envDefault:"10"`
	MaxIdleConns    int           `env:"POSTGRES_MAX_IDLE_CONNS" envDefault:"5"`
	ConnMaxLifetime time.Duration `env:"POSTGRES_CONN_MAX_LIFETIME" envDefault:"3m"`
}

type WorkerConfig struct {
	PollInterval time.Duration `env:"WORKER_POLL_INTERVAL" envDefault:"1s"`
	BatchSize    int           `env:"WORKER_BATCH_SIZE" envDefault:"10"`
	MaxRetries   int32         `env:"WORKER_MAX_RETRIES" envDefault:"5"`
}

func Load() Config {
	var cfg Config

	if err := env.Parse(&cfg); err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	return cfg
}
