export enum ESortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum EFilterType {
  equals = 'equals',
  match = 'match',
  wildcard = 'wildcard',
  in = 'in',
  greaterThan = 'greaterThan',
  lowerThan = 'lowerThan',
}

export enum ERenderType {
  selectList = 'selectList',
  selectMultipleList = 'selectMultipleList',
  check = 'check',
  custom = 'custom',
}

export enum EFilterValueStrategy {
  locale = 'locale',
  data = 'data',
}
