// aqui iran las configuraciones de arranque del db
import mongoose from 'mongoose';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { config } from '@configs/configEnv';
import { redisConnection } from '@services/redis/redis.connection';

// se crea una variable el cual podra usarse para colocar los logs
const log: Logger = logger.createLogger('setupDatabase');
// "setupDatabase" es el nombre de referencia que se le dara a los logs que provengan de esta funcion

// creamos un funcion anonima
// aqui se aplica Design Pattern Singleton: https://refactoring.guru/es/design-patterns/singleton
export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`) //usamos el metodo "connect" de moongose para poder conectarse con el puerto de mongoodb
      // ya que el metodo "connect" retorna un promise usamos "then & catch" para resolver la promesa
      .then(() => {
        // siempre debe retornar un mensaje para hacer saber que se resolvio bien la promesa y el db esta OK
        // en vez de usar console.log usamos log que es de bunyan para poder tener mejor trazabilidad
        log.info('Succesfully connected to database.');
        // se usa el metodo "info" para escoger que lo muestre como info es un level HIJO
        redisConnection.connect();
        // al levantar mongoDB conectaremos redis tambien
      })
      .catch(error => {
        // siempre debe ir un mensaje para hacer saber que ocurrio un error con el arranque del db
        // en vez de usar console.log usamos log que es de bunyan para poder tener mejor trazabilidad
        log.error('Error connecting to database', error);
        // se usa el metodo "error" para escoger que lo muestre como error es un level HIJO

        return process.exit(1);
        // "process.exit" es un metodo que indica a node para terminar el proceso asincrono, su valor a colocar adentro
        // es un numero. si es (0) o se omite el numero retornara como "success" y si se coloca (1) terminara el proceso
        // de forma forzosa
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
  // aqui se usa el metodo "connection.on" con el state "disconnected" para indicar que cuando suceda ejecute el fuction dado
  // en este caso es para que vuelva a correr el proceso de mongoose de arranque nuevamente
};
