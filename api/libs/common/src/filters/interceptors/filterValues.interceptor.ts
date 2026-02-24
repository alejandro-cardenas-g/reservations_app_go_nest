import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFilterMetadataOptions, IFilterSchema } from '../interfaces';
import { I18nContext } from 'nestjs-i18n';
import { EFilterValueStrategy, METADATA_FILTERS } from '../constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FilterValuesInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18n = I18nContext.current();
    if (!i18n) throw new InternalServerErrorException();
    const { using } = this.reflector.get<IFilterMetadataOptions>(
      METADATA_FILTERS,
      context.getHandler(),
    );
    return next.handle().pipe(
      map((value: IFilterSchema) => {
        const filters = value.filters.map((item) => {
          if (item.valueStrategy !== EFilterValueStrategy.locale) return item;
          const values = i18n.t(`${using}.${item.label}`);
          return {
            ...item,
            values,
          };
        });
        return {
          ...value,
          filters,
        };
      }),
    );
  }
}
