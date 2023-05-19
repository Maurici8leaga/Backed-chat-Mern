import { IError } from './error.interface';

// se crea este abstrac class para definir una estructura de clases errores personalizados
// cada clase heredada de este class debera usar esta estructura

// la clase Error es una clase del lenguaje para manejar los Errores
// aqui se implementa Design Pattern Facade: https://refactoring.guru/es/design-patterns/facade
//y tambien se implementa Desing pattern Singleton: https://refactoring.guru/es/design-patterns/singleton
export abstract class CustomError extends Error {
  // se crean los parametros abstractos los cuales seran obligatorios colocar en las otras clases
  abstract statusCode: number;
  abstract status: string;

  // se pasa como parametro en el super el "message" el cual sera el mensaje  que se quiera mostrar cuando sea implementado
  constructor(message: string) {
    super(message);
  }

  // se crea este metodo para que cuando sea llamado muestre este objeto con estos parametros
  serializeErrors(): IError {
    return {
      message: this.message,
      status: this.status,
      statusCode: this.statusCode
    };
  }
}
