import { BadRequestException } from '@nestjs/common';
import { isEnum, registerDecorator } from 'class-validator';
import { CommonFilterValueDto } from '../dtos';
import { IFilterSchema } from '../interfaces';

export function ValidateFieldsFilter(
  schemaFields: Record<string, unknown>,
  schema: IFilterSchema['filters'],
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'ValidateFieldsFilter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {},
      validator: {
        validate(value: CommonFilterValueDto<any>[]) {
          if (!Array.isArray(value)) throw new BadRequestException();
          try {
            return value.every(
              (filter) =>
                isEnum(filter.field, schemaFields) &&
                schema.some(
                  (schemaField) => schemaField.field === filter.field,
                ),
            );
          } catch {
            throw new BadRequestException();
          }
        },
      },
    });
  };
}
