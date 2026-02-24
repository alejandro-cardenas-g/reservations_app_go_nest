import { ObjectRecord } from '@app/common/types';
import { AbstractFilter } from '../abstract.filter';
import { IFilterSchemaFilter } from './settingsSchema.interface';
import { CommonFilterValueDto } from '../dtos';

export interface IFilterFactoryMapperProvider {
  getFilter: (
    filterToAdd: CommonFilterValueDto<any, any>,
    schemaSetting: IFilterSchemaFilter<any>,
  ) => AbstractFilter<ObjectRecord, any> | undefined;
}
