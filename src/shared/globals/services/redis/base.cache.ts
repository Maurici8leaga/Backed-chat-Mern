import { createClient } from 'redis';
import Logger from 'bunyan';
// para la trazabilidad
import { config } from '@configs/configEnv';
import { logger } from '@configs/configLogs';

export type RedisClient = ReturnType<typeof createClient>;
// "ReturnType" es un utility type de typescript que es  para indicar que retorne un tipo de una funcion en este caso la funcion
// de "createClient" de redis

// se crea una clase abstracta para luego poder heredar sus propiedades
export abstract class BaseCache {
  client: RedisClient;
  log: Logger; //log sera de tipo Logger de bunyan

  constructor(cacheName: string) {
    // se le pasa "cacheName" el cual sera el nombre de la cache como parametro que estara esperando este constructor
    this.client = createClient({ url: config.REDIS_HOST }); // el client sera para crear un cliente de redis el cual necesita como parametro el url del host de redis
    this.log = logger.createLogger(cacheName); //cuando halla procesos de la cache este log nos ayudara a informandonos
    this.cacheError();
  }

  // se crea este metodo que son para errores en los procesos de la cache
  private cacheError(): void {
    // se crea un evento de redis el cual sera un error de tipo unknown
    this.client.on('error', (error: unknown) => {
      // se pasa la funcion error con log de bunyan
      this.log.error(error);
    });
  }
}
