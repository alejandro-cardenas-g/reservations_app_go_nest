import { AbstractFilter } from './abstract.filter';
import { EFilterOperators } from './constants';

export class EqualFilter<
  T extends Record<string, unknown>,
  K,
> extends AbstractFilter<T, K> {
  constructor(
    protected field: keyof T,
    protected value: K,
    protected operator: EFilterOperators = EFilterOperators.YES,
  ) {
    super();
  }
}
