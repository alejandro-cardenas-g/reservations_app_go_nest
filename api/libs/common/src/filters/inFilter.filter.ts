import { ObjectRecord, Primitive } from '../types';
import { EqualFilter } from './equal.filter';

export class InFilter<
  T extends ObjectRecord,
  K extends Primitive,
> extends EqualFilter<T, K[]> {}
