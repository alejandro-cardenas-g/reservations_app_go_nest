export enum ListOfEvents {
  reservation_created = "reservation_created",
  reservation_cancelled = "reservation_cancelled",
}

export interface IEvent<T = Record<string, unknown>> {
  type: ListOfEvents;
  idempotencyId: string;
  payload: T;
}

export type ReservationCreatedEvent = IEvent<{
  reservationId: string;
  roomId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  expiresAt: Date;
}>;

export type ReservationCancelledEvent = IEvent<{
  reservationId: string;
  guestId: string;
}>;

export type CustomEvent = ReservationCreatedEvent | ReservationCancelledEvent;

export interface IEventProcessor<T extends CustomEvent> {
  handle: (event: T) => Promise<void>;
}
