/* eslint-disable @typescript-eslint/no-unsafe-return */
import { QueryFailedError } from 'typeorm';

export const isUniqueConstraintViolation = (error: unknown): boolean => {
  return (
    error instanceof QueryFailedError &&
    error.driverError &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.driverError.code === '23505'
  );
};
