import { AbstractFilter } from './abstract.filter';
import { EFilterOperators } from './constants';

export class MatchFilter<
  T extends Record<string, unknown>,
> extends AbstractFilter<T, string> {
  constructor(
    protected field: keyof T,
    protected value: string,
    protected operator: EFilterOperators = EFilterOperators.YES,
  ) {
    super();
  }
}
