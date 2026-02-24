import { Injectable } from '@nestjs/common';
import { ROOM_TYPES } from '../types/room-type';
import { HotelsRepository } from '../repositories/hotels.repository';
import { RoomsRepository } from '../repositories/rooms.repository';

const MIN_ROOMS_PER_HOTEL = 5;
const MAX_ROOMS_PER_HOTEL = 20;
const ROOM_NUMBER_FLOOR_START = 1;
const ROOM_NUMBER_FLOOR_END = 5;
const ROOMS_PER_FLOOR = 20;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Generates room numbers like "101", "205", "312" without duplicates. */
function generateRoomNumbers(count: number): string[] {
  const set = new Set<string>();
  while (set.size < count) {
    const floor = randomInt(ROOM_NUMBER_FLOOR_START, ROOM_NUMBER_FLOOR_END);
    const room = randomInt(1, ROOMS_PER_FLOOR);
    set.add(`${floor}${room.toString().padStart(2, '0')}`);
  }
  return Array.from(set);
}

@Injectable()
export class RoomsSeedService {
  constructor(
    private readonly hotelsRepository: HotelsRepository,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  async run(): Promise<{ hotelsProcessed: number; roomsCreated: number }> {
    const hotels = await this.hotelsRepository.find();
    if (hotels.length === 0) {
      return { hotelsProcessed: 0, roomsCreated: 0 };
    }

    let roomsCreated = 0;
    for (const hotel of hotels) {
      const existingCount = await this.roomsRepository.count({
        where: { hotelId: hotel.id },
      });
      if (existingCount > 0) {
        continue;
      }
      const count = randomInt(MIN_ROOMS_PER_HOTEL, MAX_ROOMS_PER_HOTEL);
      const roomNumbers = generateRoomNumbers(count);
      const rooms = roomNumbers.map((roomNumber) =>
        this.roomsRepository.create({
          hotelId: hotel.id,
          roomNumber,
          type: pickRandom(ROOM_TYPES),
        }),
      );
      await this.roomsRepository.save(rooms);
      roomsCreated += rooms.length;
    }

    return {
      hotelsProcessed: hotels.length,
      roomsCreated,
    };
  }
}
