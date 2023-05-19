import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { mailTransport } from '@services/emails/mail.transport';

// se crea una variable el cual podra usarse para colocar los logs
const log: Logger = logger.createLogger('emailWorker');
// "emailWorker" es el nombre de referencia que se le dara a los logs que provengan de esta funcion

class EmailWorker {
  // este sera el metodo del worker para enviar la notificacion del email
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;
      // envio del email
      await mailTransport.sendEmail(receiverEmail, subject, template);
      // como es un proceso asincrono se espera que el mailTransport envie el email

      // notificacion de que el job fue completado
      job.progress(100);
      // el 100 es para indicar que se proceso al 100%, se debe colocar ya que el espera un numero como parametro

      // finilizacion del proceso del job
      done(null, job.data);
      // el done espera 2 parametros, 1ro es el error de existir, y el 2do es el value en este caso la data
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
