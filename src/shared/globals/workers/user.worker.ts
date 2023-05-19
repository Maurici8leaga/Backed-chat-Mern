import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { userService } from '@services/db/user.service';

// se crea este log de tipo Logger de bunyan, para tener una trazabilidad. y con logger de nuestros configs nos mostrara
// esa traazabilidad . el nombre de los logs que ocurran aqui llevaran el nombre de "userWorker"
const log: Logger = logger.createLogger('userWorker');

class UserWorker {
  // este va a ser un worker para ayudar agregar usuarios al DB
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    // Job es el evento del trabajo, DoneCalllback es para que se ejecute cuando ocurran errores, este ejecutara un callback
    try {
      const { value } = job.data;

      // crear un usuario en la DB
      await userService.addUserData(value);
      // esta sera el job a realizar de este worker especifico

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

export const userWorker: UserWorker = new UserWorker();
