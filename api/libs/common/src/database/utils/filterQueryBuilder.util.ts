/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  EqualFilter,
  GreaterThanFilter,
  InFilter,
  LowerThanFilter,
  MatchFilter,
} from '@app/common/filters';
import { AbstractFilter } from '@app/common/filters/abstract.filter';
import { EFilterOperators } from '@app/common/filters/constants';
import { ExtractFilters } from '@app/common/filters/utils';
import { ObjectRecord } from '@app/common/types';
import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export const getEqualOperator = (
  filter: EqualFilter<ObjectRecord, any>,
): [where: string, parameters: ObjectLiteral] => {
  const operator = filter.Operator === EFilterOperators.YES ? '=' : '<>';
  return [
    `${filter.Field} ${operator} :${filter.Field}`,
    { [filter.Field]: filter.Value },
  ];
};

export const getMatchOperator = (
  filter: MatchFilter<ObjectRecord>,
): [where: string, parameters: ObjectLiteral] => {
  const operator =
    filter.Operator === EFilterOperators.YES ? 'ILIKE' : 'NOT ILIKE';
  return [
    `${filter.Field} ${operator} :${filter.Field}`,
    { [filter.Field]: `%${filter.Value}%` },
  ];
};

export const getInOperator = (
  filter: InFilter<ObjectRecord, any>,
): [where: string, parameters: ObjectLiteral] => {
  const operator = filter.Operator === EFilterOperators.YES ? 'IN' : 'NOT IN';
  return [
    `${filter.Field} ${operator} (:...${filter.Field})`,
    { [filter.Field]: filter.Value },
  ];
};

export const getGreaterThanOperator = (
  filter: GreaterThanFilter<ObjectRecord, any>,
): [where: string, parameters: ObjectLiteral] => {
  let operator = filter.Inclusive ? '>=' : '>';
  if (filter.Operator === EFilterOperators.NOT) {
    operator = filter.Inclusive ? '<=' : '<';
  }
  return [
    `${filter.Field} ${operator} :${filter.Field}`,
    { [filter.Field]: filter.Value },
  ];
};

export const getLowerThanOperator = (
  filter: LowerThanFilter<ObjectRecord, any>,
): [where: string, parameters: ObjectLiteral] => {
  let operator = filter.Inclusive ? '<=' : '<';
  if (filter.Operator === EFilterOperators.NOT) {
    operator = filter.Inclusive ? '>=' : '>';
  }
  return [
    `${filter.Field} ${operator} :${filter.Field}`,
    { [filter.Field]: filter.Value },
  ];
};

@Injectable()
export class FilterQueryBuilder<Entity extends ObjectLiteral> {
  private whereInitialized = false;

  constructor(private query: SelectQueryBuilder<Entity>) {}

  private addEqualWhere(filter: EqualFilter<ObjectRecord, any>) {
    if (!this.whereInitialized) {
      this.whereInitialized = true;
      this.query.where(...getEqualOperator(filter));
      return;
    }
    this.query.andWhere(...getEqualOperator(filter));
  }

  private addMatchWhere(filter: MatchFilter<ObjectRecord>) {
    if (!this.whereInitialized) {
      this.whereInitialized = true;
      this.query.where(...getMatchOperator(filter));
      return;
    }
    this.query.andWhere(...getMatchOperator(filter));
  }

  private addInWhere(filter: InFilter<ObjectRecord, any>) {
    if (!this.whereInitialized) {
      this.whereInitialized = true;
      this.query.where(...getInOperator(filter));
      return;
    }
    this.query.andWhere(...getInOperator(filter));
  }

  private addGreaterThanWhere(filter: GreaterThanFilter<ObjectRecord, any>) {
    if (!this.whereInitialized) {
      this.whereInitialized = true;
      this.query.where(...getGreaterThanOperator(filter));
      return;
    }
    this.query.andWhere(...getGreaterThanOperator(filter));
  }

  private addLowerThanWhere(filter: LowerThanFilter<ObjectRecord, any>) {
    if (!this.whereInitialized) {
      this.whereInitialized = true;
      this.query.where(...getLowerThanOperator(filter));
      return;
    }
    this.query.andWhere(...getLowerThanOperator(filter));
  }

  withQuery(filters: AbstractFilter<ObjectRecord, any>[]) {
    const equalFilters = ExtractFilters.getEquals(filters);
    const matchFilters = ExtractFilters.getWildcards(filters);
    const inFilters = ExtractFilters.getIn(filters);
    const greaterThanFilters = ExtractFilters.getGreaterThan(filters);
    const lowerThanFilters = ExtractFilters.getLowerThan(filters);

    for (const filter of equalFilters) {
      this.addEqualWhere(filter);
    }
    for (const filter of matchFilters) {
      this.addMatchWhere(filter);
    }
    for (const filter of inFilters) {
      this.addInWhere(filter);
    }
    for (const filter of greaterThanFilters) {
      this.addGreaterThanWhere(filter);
    }
    for (const filter of lowerThanFilters) {
      this.addLowerThanWhere(filter);
    }
    return this.query;
  }
}
