export type CreateOutboxCommand = {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
};

export interface IOutboxRepository {
  publish(outboxEvent: CreateOutboxCommand): Promise<void>;
}
