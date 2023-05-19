import { IEmailJob } from '@user/interfaces/emailJob.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { emailWorker } from '@workers/email.worker';

// se crea un class de herencia de la clase abstracta
class EmailQueue extends BaseQueue {
  constructor() {
    super('emails'); //emails sera el nombre de este queue
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
    // se le pasa processJob de la clase abstracta BaseQueue para que procese este queue cuando sea llamado
    // la concurrencia es un num el cual sera el numero de workers que tendra para resolver la tarea asignada, (5) es un numero estandar
    // addNotificationEmail es una funcion para enviar la notificacion del email
  }

  // crea una funcion publica para agregar un job
  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
    // addJob es una funcion de la clase abstracta BaseQueue
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
