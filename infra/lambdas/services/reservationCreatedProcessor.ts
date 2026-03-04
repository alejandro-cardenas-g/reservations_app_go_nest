import { IEventProcessor, ReservationCreatedEvent } from "../../types/event";
import { ReservationsRepository } from "../repositories/reservations.repository";

export class ReservationCreatedProcessor implements IEventProcessor<ReservationCreatedEvent> {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async handle(event: ReservationCreatedEvent) {
    console.log("ReservationCreatedProcessor", event);
    return;
  }
}
