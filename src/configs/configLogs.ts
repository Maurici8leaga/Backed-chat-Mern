import bunyan from 'bunyan';

// se crea un class para solo crear los logs
class LoggerConfig {
  // metodo publico para poder crear los logs con bunyan
  public createLogger(name: string): bunyan {
    // el parametro es el nombre que se le dara de referencia al log
    return bunyan.createLogger({ name, level: 'debug' });
    // el 1er parametro es el nombre de referencia y el 2do es el tipo de nivel PADRE el cual se basa en el entorno que se este trabajando
    // en este caso como es de desarrollo se usa "debug"
  }
}

export const logger: LoggerConfig = new LoggerConfig();
