import { ObjectRecord } from '@app/common/types';
import { AbstractFilter } from '../abstract.filter';
import { CommonFilterValueDto } from '../dtos';
import {
  FilterValueType,
  IFilterFactoryMapperProvider,
  IFilterSchemaFilter,
} from '../interfaces';

export class GetSchemaFilter {
  static getFilters(
    currentFilters: CommonFilterValueDto<any, any>[],
    availableFilters: IFilterSchemaFilter<any>[],
    factoryFilterMapper: IFilterFactoryMapperProvider,
  ): AbstractFilter<ObjectRecord, any>[] {
    const mapper: Record<string, IFilterSchemaFilter<any> | undefined> =
      Object.fromEntries(
        availableFilters.map((filter) => [filter.field, filter]),
      );
    const filters: AbstractFilter<ObjectRecord, any>[] = [];
    for (const filter of currentFilters) {
      const filterToAdd = mapper[filter.field as keyof ObjectRecord];
      if (!filterToAdd) continue;
      const filterValue = factoryFilterMapper.getFilter(filter, filterToAdd);
      if (!filterValue) continue;
      filters.push(filterValue);
    }
    return filters;
  }

  static getFilterValue(value: unknown, valueType: FilterValueType) {
    switch (valueType) {
      case 'boolean':
        return Boolean(value);
      case 'number':
        return Number(value);
      case 'string':
        return String(value);
    }
  }
}
