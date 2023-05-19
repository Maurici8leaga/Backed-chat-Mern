import { BaseQueue } from './base.queue';
import { userWorker } from '@workers/user.worker';
import { IUserJob } from '@user/interfaces/userJob.interface';

// se crea un class de herencia de la clase abstracta
// aqui es donde iran los procesos de emails para darle mejor performance
class UserQueue extends BaseQueue {
  constructor() {
    super('user'); //user sera el nombre de este queue
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    // se le pasa processJob de la clase abstracta BaseQueue para que procese este queue cuando sea llamado
    // la concurrencia es un num el cual sera el numero de workers que tendra para resolver la tarea asignada, (5) es un numero estandar
    // addUserToDB es una funcion asincrona que se creo para agregar un user al DB este sera el callback esperado de "processJob"
  }

  // crea una funcionn publica para agregar un job
  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
    // addJob es una funcion de la clase abstracta BaseQueue
  }
}

export const userQueue: UserQueue = new UserQueue();
