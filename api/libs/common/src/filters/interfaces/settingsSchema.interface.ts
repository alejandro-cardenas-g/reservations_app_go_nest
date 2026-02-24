import {
  EFilterOperators,
  EFilterType,
  EFilterValueStrategy,
  ERenderType,
  ESortType,
} from '../constants';

export interface IFilterSchemaSort {
  field: string;
  label: string;
  types: ESortType[];
}

export type TRenderFilter =
  | {
      type:
        | ERenderType.check
        | ERenderType.selectList
        | ERenderType.selectMultipleList;
    }
  | {
      type: ERenderType.custom;
      customRenderName: string;
    };

export interface IFilterSettingsFilterValues<T> {
  label: string;
  value: T;
  operator: EFilterOperators;
}

export type FilterValueType = 'boolean' | 'string' | 'number';

export interface IFilterSchemaFilter<T> {
  label: string;
  field: string;
  filterType: EFilterType;
  render: TRenderFilter;
  valueType: FilterValueType;
  values: IFilterSettingsFilterValues<T>[];
  valueStrategy: EFilterValueStrategy;
}

export interface IFilterSchema {
  filters: IFilterSchemaFilter<any>[];
  sort: IFilterSchemaSort[];
  pagination: number[];
  defaults: {
    sort: {
      type: ESortType;
      field: string;
    };
    pagination: number;
  };
}
