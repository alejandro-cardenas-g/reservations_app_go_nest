import {
  databaseEnvironments,
  DB_CONNECTIONS,
  serverEnvironment,
} from '@app/common/configuration/constants';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IGetConnectionOptions } from '../database.interface';
import { IConnectionFactory } from './connectionFactory.interface';

export class MainConnectionFactory implements IConnectionFactory {
  constructor(private readonly configService: ConfigService) {}

  getConnection(opts: IGetConnectionOptions): TypeOrmModuleOptions {
    const environment = this.configService.getOrThrow<string>(
      serverEnvironment.NODE_ENV,
    );
    return {
      name: DB_CONNECTIONS.MAIN,
      type: 'postgres',
      host: this.configService.getOrThrow<string>(databaseEnvironments.DB_HOST),
      port: Number(
        this.configService.getOrThrow<number>(databaseEnvironments.DB_PORT),
      ),
      username: this.configService.getOrThrow<string>(
        databaseEnvironments.DB_USER,
      ),
      password: this.configService.getOrThrow<string>(
        databaseEnvironments.DB_PASSWORD,
      ),
      database: this.configService.getOrThrow<string>(
        databaseEnvironments.DB_NAME,
      ),
      entities: opts.models,
      synchronize: false,
      autoLoadEntities: false,
      ssl:
        process.env.DB_SSL === '0'
          ? undefined
          : {
              rejectUnauthorized: false,
            },
      logging: environment === 'production' ? false : true,
    };
  }
}
