import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { authService } from '@services/db/auth.service';

// se crea este log de tipo Logger de bunyan, para tener una trazabilidad. y con logger de nuestros configs nos mostrara
// esa traazabilidad . el nombre de los logs que ocurran aqui llevaran el nombre de "authWorker"
const log: Logger = logger.createLogger('authWorker');

class AuthWorker {
  // este sera un worker para ayudar a insertar schema de autenticacion  del user
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    // Job es el evento del trabajo, DoneCalllback es para que se ejecute cuando ocurran errores, este ejecutara un callback
    try {
      const { value } = job.data;

      // crear un usuario en la DB
      await authService.createAuthUser(value);
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

export const authWorker: AuthWorker = new AuthWorker();
