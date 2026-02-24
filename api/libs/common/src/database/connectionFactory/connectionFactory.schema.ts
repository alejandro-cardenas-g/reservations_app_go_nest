import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { ConfigService } from '@nestjs/config';
import { IConnectionFactory } from './connectionFactory.interface';
import { MainConnectionFactory } from './mainConnectionFactory';
import { ClassConstructor } from '@app/common/types';

export const connectionFactoryStrategy: Map<
  string,
  ClassConstructor<IConnectionFactory, [ConfigService]>
> = new Map();
connectionFactoryStrategy.set(DB_CONNECTIONS.MAIN, MainConnectionFactory);
