import Joi, { ObjectSchema } from 'joi';

// aqui se define la estructuraa del esquema para el registro de un usuario

// se crea un objeto de tipo ObjectSchema
const signupSchema: ObjectSchema = Joi.object().keys({
  // con "Joi.object()"se crea un objeto de joi y con "keys" se valida los keys de ese objeto

  // las siguientes son validaciones de los keys o propiedades del objeto, para asi asegurar que el usuario las llene correctamente
  username: Joi.string().required().min(4).max(8).messages({
    // con "required" especificamos que debe ir este parametro
    // messages es para colocar un mensaje si el usuario incumple uno de los parametros ya colocado anteriormente
    'string.base': 'Username must be of type string',
    // string.base es el tipo que debe ser ese string
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(4).max(8).messages({
    // min es el numero minimo de characteres que tendra este parametro y max es el maximo
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    // email es para indicar que es de tipo email
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  }),
  avatarColor: Joi.string().required().messages({
    'any.required': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  })
});

export { signupSchema };
