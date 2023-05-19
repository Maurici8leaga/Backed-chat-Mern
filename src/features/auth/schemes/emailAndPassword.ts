import Joi, { ObjectSchema } from 'joi';

// aqui se define la estructuraa del esquema para el email y password del usuario

// se crea un objeto de tipo ObjectSchema
const emailSchema: ObjectSchema = Joi.object().keys({
  // con "Joi.object()"se crea un objeto de joi y con "keys" se valida los keys de ese objeto

  // las siguietes son validaciones de los keys o propiedades del objeto, para asi asegurar que el usuario las envie

  email: Joi.string().email().required().messages({
    // con "required" especificamos que debe ir este parametro
    // messages es para colocar un mensaje si el usuario incumple uno de los parametros ya colocado anteriormente

    'string.base': 'Field must be a string',
    // string.base es el tipo que debe ser ese string
    'string.required': 'Email is a required field',
    'string.email': 'Email must be valid'
  })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().required().min(4).max(8).messages({
    // min es el numero minimo de characteres que tendra este parametro y max es el maximo
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  // este confirmPassword sera para casos en que el usuario quiera cambiar de clave por ejemplo
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    // joi.ref() permite apuntar a una propiedad de referencia en este caso el paassword introducido anterior
    // ".valid()" verifica que haga match con el parametro pasado, si no da error
    'any.only': 'Passwords should match',
    // any.only hace que si y solo si hace match se cumplira si no mostrara el este error
    'any.required': 'Confirm password is a required field'
  })
});

export { emailSchema, passwordSchema };
