import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ROOM_TYPES } from '../types/room-type';

export class CreateRoomDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  roomNumber: string;

  @IsIn(ROOM_TYPES)
  type: (typeof ROOM_TYPES)[number];
}
