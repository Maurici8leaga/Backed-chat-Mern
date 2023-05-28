import { JoiRequestValidationError } from '@helpers/errors/joiValidateError';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: unknown, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: unknown, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: [Request]) {
      const req: Request = args[0];

      const { error } = await Promise.resolve(schema.validate(req.body));

      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
