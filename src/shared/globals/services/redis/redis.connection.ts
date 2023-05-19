import Logger from 'bunyan';
// para la trazabilidad
import { logger } from '@configs/configLogs';
import { BaseCache } from './base.cache';
// la clase abstracta

// se crea este log de tipo Logger de bunyan, para tener una trazabilidad. y con logger de nuestros configs nos mostrara
// esa traazabilidad . el nombre de los logs que ocurran aqui llevaran el nombre de "redisConnection"
const log: Logger = logger.createLogger('redisConnection');

// se crea una clase con herencia de la clase abstracta de base.cache
class RedisConnection extends BaseCache {
  constructor() {
    // "redisConnection" sera el nombre de la cache
    super('redisConnection');
  }

  // se  crea una funcion asincrona de tipo promise
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      // se espera que el "client" se cree y  se conecte con redis

      log.info(`Redis connection: ${await this.client.ping()}`);
      // y con el log mandamos un mensaje a la terminal para indicar que la coneccion con redis esta activa
    } catch (error) {
      // en caso de haber problema con el log se manda un mensaje de error con el error
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
