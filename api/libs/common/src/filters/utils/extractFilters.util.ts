import { AbstractFilter } from '@app/common/filters/abstract.filter';
import { ObjectRecord } from '@app/common/types';
import { EqualFilter } from '../equal.filter';
import { MatchFilter } from '../match.filter';
import { InFilter } from '../inFilter.filter';
import { GreaterThanFilter } from '../greaterThan.filter';
import { LowerThanFilter } from '../lowerThan.filter';

export class ExtractFilters {
  static getEquals(
    filters: AbstractFilter<ObjectRecord, any>[],
  ): EqualFilter<ObjectRecord, any>[] {
    return filters.filter(
      (filter) => filter instanceof EqualFilter,
    ) as unknown as EqualFilter<ObjectRecord, any>[];
  }

  static getWildcards(
    filters: AbstractFilter<ObjectRecord, any>[],
  ): MatchFilter<ObjectRecord>[] {
    return filters.filter(
      (filter) => filter instanceof MatchFilter,
    ) as unknown as MatchFilter<ObjectRecord>[];
  }

  static getIn(
    filters: AbstractFilter<ObjectRecord, any>[],
  ): InFilter<ObjectRecord, any>[] {
    return filters.filter(
      (filter) => filter instanceof InFilter,
    ) as unknown as InFilter<ObjectRecord, any>[];
  }

  static getGreaterThan(
    filters: AbstractFilter<ObjectRecord, any>[],
  ): GreaterThanFilter<ObjectRecord, any>[] {
    return filters.filter(
      (filter) => filter instanceof GreaterThanFilter,
    ) as unknown as GreaterThanFilter<ObjectRecord, any>[];
  }

  static getLowerThan(
    filters: AbstractFilter<ObjectRecord, any>[],
  ): LowerThanFilter<ObjectRecord, any>[] {
    return filters.filter(
      (filter) => filter instanceof LowerThanFilter,
    ) as unknown as LowerThanFilter<ObjectRecord, any>[];
  }
}
