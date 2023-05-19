import { IError } from './error.interface';

// DATO cuando se coloca la I primero seguido del nombre en una interfaz es para hacer saber que es de una interfaz

// se crea una interfaz para asi crear la estructura que tendra los mensajes de error que la hereden
export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  // DATO la palabra serialize es un nombre que se le da a un metodo que retorna una cierto tipo de estructura
  serializeErrors(): IError;
}
