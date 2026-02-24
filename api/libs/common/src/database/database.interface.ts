import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface IGetConnectionOptions {
  models: TypeOrmModuleOptions['entities'];
}
