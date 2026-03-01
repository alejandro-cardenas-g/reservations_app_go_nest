package store

import (
	"context"
	"fmt"
	"log"
	"time"
	"workers/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	TxManager *TxManager
	Outbox    *OutboxRepository
}

func NewStore(cfg config.StoreConfig) *Store {

	poolCfg, err := pgxpool.ParseConfig(cfg.URL)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Database initalized")

	poolCfg.MaxConns = int32(cfg.MaxOpenConns)
	poolCfg.MinConns = int32(cfg.MaxIdleConns)
	poolCfg.MaxConnLifetime = time.Duration(cfg.ConnMaxLifetime)
	poolCfg.MaxConnIdleTime = 1 * time.Minute
	poolCfg.HealthCheckPeriod = 30 * time.Second

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)

	if err != nil {
		log.Fatal(err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}

	store := &Store{}

	store.Outbox = NewOutboxRepository(pool)
	store.TxManager = NewTxManager(pool)
	return store
}
