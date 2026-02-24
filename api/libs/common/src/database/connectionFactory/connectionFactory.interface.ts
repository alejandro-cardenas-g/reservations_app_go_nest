import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IGetConnectionOptions } from '../database.interface';

export interface IConnectionFactory {
  getConnection(models: IGetConnectionOptions): TypeOrmModuleOptions;
}
