import { IFilterSettingsFilterValues } from './settingsSchema.interface';

export interface IFilterValuesProvider<T> {
  getValues(...args: any): Promise<IFilterSettingsFilterValues<T>[]>;
}
