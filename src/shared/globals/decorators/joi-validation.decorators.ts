// Hacer abstractiones de validaciones de los esquemas de datos para luego inyectarlos
// mediante inyecccion de dependencias cuando manipule la logica de negocio

// un decorador es una abstraccion de logica para ser implementada en otra seccion del codigo
import { JoiRequestValidationError } from '@helpers/errors/joiValidateError';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

// se crea un type para definir la esctructura
type IJoiDecorator = (target: unknown, key: string, descriptor: PropertyDescriptor) => void;

// creamos una funcion para validacion de un schema de joi
export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  // se pasa los parametros que retornara esta funcion
  return (_target: unknown, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    // para  asegurar que  el value de cada key sea correcto y cumpla con los parametros indicados se crea este async function
    descriptor.value = async function (...args: [Request]) {
      // el cual analizara todos los argumentos para verificar que estan bien antes de ser enviados
      // va un array de con argumentos de Request ya que todos los argumentos son de Request
      const req: Request = args[0]; //se usa args[0] para que comience con el 1er parametro
      // luego "schema.validate" repitira este proceso con cada parametro por eso el async await para verificar que todos cumplan

      // dentro del schema.validate se debe pasar el json para que joi lo valide, por eso req.body da referencia al json que se quiere enviar
      const { error } = await Promise.resolve(schema.validate(req.body));
      // si Promise se resuelve correctamente sin eror entoces error sera undefined

      // al colocar error.details se coloca el signo ? automaticamente ya que de existir error y si tiene esa propiedad entonces ...
      if (error?.details) {
        // de existir un error entonces retornara un mensaje "JoiRequestValidationError" que es un metodo que creamos en los helpers
        throw new JoiRequestValidationError(error.details[0].message);
        // el "details[0]" es el 1er mensaje mas descriptivo de error por eso lo usamos para el mensaje
      }
      return originalMethod.apply(this, args); //si no hay error entonces pasa la prueba y se adjuntan a originalMethod
      // el this hace referencia a todo el objeto y args son los args que se verificaron
    };
    return descriptor; //si todo cumple bien "descriptor" enviara todos los parametros con sus valores
  };
}
