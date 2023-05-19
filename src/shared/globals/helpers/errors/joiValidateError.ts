// HTTP_STATUS tiene todos los status de errores del servidor
import HTTP_STATUS from 'http-status-codes';
import { CustomError } from './customError';

// se crea una clase heredada de la class abstracta CustomError para crear este error para solo esta ocasion
// Principle SOLID: Liskov Sustitution
export class JoiRequestValidationError extends CustomError {
  // se crea este para los bad request de joi

  // "BAD_REQUEST" es el status code que tendra este error estos son nombres de referecia que los acompañan
  statusCode = HTTP_STATUS.BAD_REQUEST;
  status = 'error';

  // se coloca en el constructor el parametro message para que se coloque el tipo de mensaje que se quiera mostrar
  // cuado sea implementado
  constructor(message: string) {
    super(message);
  }
}
