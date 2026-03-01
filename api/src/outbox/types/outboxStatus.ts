export const OUTBOX_STATUSES = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'PROCESSING',
] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];
