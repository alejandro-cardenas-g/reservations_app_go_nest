import { AbstractFilter } from './abstract.filter';
import { EFilterOperators } from './constants';

export class GreaterThanFilter<
  T extends Record<string, unknown>,
  K,
> extends AbstractFilter<T, K> {
  constructor(
    protected field: keyof T,
    protected value: K,
    protected inclusive: boolean = true,
    protected operator: EFilterOperators = EFilterOperators.YES,
  ) {
    super();
  }

  get Inclusive() {
    return this.inclusive;
  }
}
