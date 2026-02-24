import { EFilterOperators } from './constants';

export abstract class AbstractFilter<T, K> {
  protected abstract field: keyof T;
  protected abstract value: K;
  protected abstract operator: EFilterOperators;

  get Field() {
    return this.field;
  }

  get Value() {
    return this.value;
  }

  get Operator() {
    return this.operator;
  }
}
