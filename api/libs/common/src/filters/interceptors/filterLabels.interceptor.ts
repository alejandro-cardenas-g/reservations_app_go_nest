import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { METADATA_FILTERS_LABELS } from '../constants';
import { IFilterMetadataOptions, IFilterSchema } from '../interfaces';

@Injectable()
export class FilterLabelsInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18n = I18nContext.current();
    if (!i18n) throw new InternalServerErrorException();
    const { using } = this.reflector.get<IFilterMetadataOptions>(
      METADATA_FILTERS_LABELS,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((value: IFilterSchema) => {
        const filters = value.filters.map((item) => {
          item.label = i18n.t(`${using}.${item.label}`);
          return item;
        });
        const sort = value.sort.map((item) => {
          item.label = i18n.t(`${using}.${item.label}`);
          return item;
        });
        return {
          ...value,
          filters,
          sort,
        };
      }),
    );
  }
}
