export const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE'] as const;
export type RoomType = (typeof ROOM_TYPES)[number];
