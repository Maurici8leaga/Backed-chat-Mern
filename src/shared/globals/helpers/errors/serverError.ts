// HTTP_STATUS tiene todos los status de errores del servidor
import HTTP_STATUS from 'http-status-codes';
import { CustomError } from './customError';

// se crea una clase heredada de la class abstracta CustomError para crear este error para solo esta ocasion
export class ServerError extends CustomError {
  // se crea este class para cuando el servidor tenga un error por ejemplo mucho tiempo cargado un proceso

  // "SERVICE_UNAVAILABLE" es el status code que tendra este error estos son nombres de referecia que los acompañan
  statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
  status = 'error';

  // se coloca en el constructor el parametro message para que se coloque el tipo de mensaje que se quiera mostrar
  // cuado sea implementado
  constructor(message: string) {
    super(message);
  }
}
