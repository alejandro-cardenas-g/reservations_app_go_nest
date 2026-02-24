import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { connectionFactoryStrategy } from './connectionFactory/connectionFactory.schema';
import { IGetConnectionOptions } from './database.interface';

@Module({})
export class DatabaseModule {
  static forFeature(
    connectionName: string,
    models: EntityClassOrSchema[] = [],
  ) {
    return TypeOrmModule.forFeature(models, connectionName);
  }

  static forRoot(
    connectionName: string,
    opts: IGetConnectionOptions,
  ): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          name: connectionName,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const OptionServiceConstructor =
              connectionFactoryStrategy.get(connectionName);
            if (!OptionServiceConstructor) throw new Error();
            const options = new OptionServiceConstructor(configService);
            return options.getConnection(opts);
          },
        }),
      ],
    };
  }
}
