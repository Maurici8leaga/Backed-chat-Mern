import { BaseQueue } from './base.queue';
import { IAuthJob } from '@auth/interfaces/authJob.interface';
import { authWorker } from '@workers/auth.worker';

// se crea un class de herencia de la clase abstracta (SRP)
class AuthQueue extends BaseQueue {
  constructor() {
    super('auth'); //auth sera el nombre de este queue
    this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
    // se le pasa processJob de la clase abstracta BaseQueue para que procese este queue cuando sea llamado
    // la concurrencia es un num el cual sera el numero de workers que tendra para resolver la tarea asignada, (5) es un numero estandar
    // addAuthUserToDB es una funcion asincrona que se creo para agregar un user al DB este sera el callback esperado de "processJob"
  }

  // crea una funcionn publica para agregar un job
  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
    // addJob es una funcion de la clase abstracta BaseQueue
  }
}

export const authQueue: AuthQueue = new AuthQueue();
