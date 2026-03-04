import { SQSBatchResponse, SQSEvent } from "aws-lambda";
import { IEventProcessor, ListOfEvents, CustomEvent } from "../../types/event";
import { ReservationCreatedProcessor } from "../services/reservationCreatedProcessor";
import { ReservationCancelledProcessor } from "../services/reservationCancelledProcessor";
import { Pool } from "pg";
import { ReservationsRepository } from "../repositories/reservations.repository";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  maxUses: 1000,
});

const reservationsRepository = new ReservationsRepository(pool);

const mapProcessors = new Map<ListOfEvents, IEventProcessor<any>>();
mapProcessors.set(
  ListOfEvents.reservation_created,
  new ReservationCreatedProcessor(reservationsRepository),
);
mapProcessors.set(
  ListOfEvents.reservation_cancelled,
  new ReservationCancelledProcessor(reservationsRepository),
);

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    const body = JSON.parse(record.body) as CustomEvent;

    try {
      const hasEvent = mapProcessors.has(body.type);

      if (!hasEvent) {
        batchItemFailures.push({
          itemIdentifier: record.messageId,
        });
        continue;
      }

      await mapProcessors.get(body.type)!.handle(body);
    } catch (exception) {
      console.error("Error processing event", exception);

      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  return {
    batchItemFailures,
  };
};
