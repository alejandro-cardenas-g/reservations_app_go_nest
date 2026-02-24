import {
  DatabaseEnvironments,
  ServerEnvironments,
} from '../types/environment.type';

export const databaseEnvironments: Record<DatabaseEnvironments, string> = {
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USER: 'DB_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_NAME: 'DB_NAME',
} as const;

export const serverEnvironment: Record<ServerEnvironments, string> = {
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
} as const;

export const authEnvironments = {
  COOKIE_AUTH_NAME: 'COOKIE_AUTH_NAME',
  SECRET_ACCESS: 'SECRET_ACCESS',
  SECRET_REFRESH: 'SECRET_REFRESH',
};
