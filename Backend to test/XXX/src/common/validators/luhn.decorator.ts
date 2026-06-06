import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function luhnCheck(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  let sum = 0;
  for (let position = 0; position < value.length; position++) {
    let digit = Number(value[value.length - 1 - position]);
    if (position % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

@ValidatorConstraint({ name: 'IsLuhn', async: false })
class IsLuhnConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [expectedLength] = (args.constraints ?? []) as [number | undefined];
    if (typeof value !== 'string') return false;
    if (expectedLength !== undefined && value.length !== expectedLength) return false;
    return luhnCheck(value);
  }
  defaultMessage(args: ValidationArguments) {
    const [expectedLength] = (args.constraints ?? []) as [number | undefined];
    const lenMsg = expectedLength ? ` exactly ${expectedLength} digits and` : '';
    return `${args.property} must have${lenMsg} pass the Luhn check.`;
  }
}

export function IsLuhn(expectedLength?: number, options?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options,
      constraints: [expectedLength],
      validator: IsLuhnConstraint,
    });
  };
}
