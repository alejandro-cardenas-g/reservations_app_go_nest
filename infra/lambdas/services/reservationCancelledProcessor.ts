import { IEventProcessor, ReservationCancelledEvent } from "../../types/event";
import { ReservationsRepository } from "../repositories/reservations.repository";

export class ReservationCancelledProcessor implements IEventProcessor<ReservationCancelledEvent> {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async handle(event: ReservationCancelledEvent) {
    console.log("ReservationCancelledProcessor", event);
    return;
  }
}
