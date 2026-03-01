package main

import "context"

type Processor interface {
	Run(ctx context.Context)
}
