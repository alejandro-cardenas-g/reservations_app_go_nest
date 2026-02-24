import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { METADATA_FILTERS, METADATA_FILTERS_LABELS } from '../constants';
import {
  FilterLabelsInterceptor,
  FilterValuesInterceptor,
} from '../interceptors';

export const TranslateFilters = (values: string, labels: string) => {
  return applyDecorators(
    SetMetadata(METADATA_FILTERS, { using: values }),
    SetMetadata(METADATA_FILTERS_LABELS, { using: labels }),
    UseInterceptors(FilterLabelsInterceptor, FilterValuesInterceptor),
  );
};
