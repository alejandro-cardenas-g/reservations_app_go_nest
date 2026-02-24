/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require('dotenv');
// eslint-disable-next-line @typescript-eslint/unbound-method
const { resolve } = require('path');
const { DataSource } = require('typeorm');

config();

const dataSource = new DataSource({
  name: 'main',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  logger: process.env.NODE_ENV === 'production' ? 'debug' : 'advanced-console',
  entities: [],
  migrations: [resolve(__dirname, './migrations/main/*{.ts,.js}')],
  subscribers: [],
  poolSize: 10,
  applicationName: 'reservations.api',
  connectTimeoutMS: 10_000,
  ssl:
    process.env.DB_SSL === '0'
      ? false
      : {
          rejectUnauthorized: false,
        },
  extra: {
    application_name: 'reservations.api',
  },
});

module.exports = dataSource;
