import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

export function IsISODateOnly(validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    Transform(({ value }) => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T00:00:00.000Z`);
      }
      return value;
    })(target, propertyName);

    registerDecorator({
      name: 'isISODateOnly',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value instanceof Date && !isNaN(value.getTime())) {
            return true;
          }
          if (typeof value === 'string') {
            return /^\d{4}-\d{2}-\d{2}$/.test(value);
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve estar no formato YYYY-MM-DD`;
        },
      },
    });
  };
}
