import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter, createBullBoard, BullAdapter } from '@bull-board/express';
// expressAdapter es para crear adaptadores al servidor de express y BullAdapter es para crear adaptadores a los queues
import { config } from '@configs/configEnv';
import { logger } from '@configs/configLogs';
import { IAuthJob } from '@auth/interfaces/authJob.interface';
import { IEmailJob } from '@user/interfaces/emailJob.interface';
import { IUserJob } from '@user/interfaces/userJob.interface';

type IBaseJobData = IAuthJob | IEmailJob | IUserJob;

// bullAdapters seran un array de adaptadores que van a partir vacios
let bullAdapters: BullAdapter[] = [];
// BullAdapter es un adaptador de "bull-board/express" para añadirle comportamiento

export let serverAdapter: ExpressAdapter;
// "serverAdapter" sera una variable de tipo "ExpressAdapter" es para que soporte colas para servidor de express

// esta sera la clase abstracta que hereadaran los otros queues
// Solid (SRP)
export abstract class BaseQueue {
  queue: Queue.Queue;
  // el 1er Queue es un constructor de bull y el 2do es el type
  log: Logger; // para la trazabilidad

  constructor(queueName: string) {
    // para las clases que hereden este class deben colocar el nombre de la cola como parametro
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`); //de esta forma se incializa y se crea un queue para un job
    // "Queue" espera 2 parametros el 1ro sera el nombre de la queue y el 2do es la direccion URL de redis
    // ya que bull trabaja con redis se debe pasar su URL, de esta forma da mejor optimizacion con respecto a la consistencia
    // para que tenga alta disponibilidad

    bullAdapters.push(new BullAdapter(this.queue)); // se empuja el nuevo queue al array de adaptadores
    bullAdapters = [...new Set(bullAdapters)];
    // se crea una copia de lo que ya existia en el array de adaptadores para que los que ya existan no se borren y sume el nuevo
    serverAdapter = new ExpressAdapter(); //de esta forma se crea el server adapter
    serverAdapter.setBasePath('/queues');
    // con "setBasePath" nos permitira crear una ruta el cual con ella podremos monitorear el procesos de las colas
    // TODAS LAS COLAS CREADAS APUNTARA A ESTA RUTA

    createBullBoard({
      // este con este create se podra crear una tabla que nos brindara facilidades de monitoriar estas colas atraves de una pg

      // este recibe 2 parametros
      queues: bullAdapters,
      // las colas con "bullAdapters"
      serverAdapter
      // y el sevidor adapter
    });

    // se crea este log para monitoriarlas
    this.log = logger.createLogger(`${queueName}Queue`);

    // eventos de las queues

    this.queue.on('completed', (job: Job) => {
      // para apuntar el evento de un queue se usa "on"
      // "completed" es el nombre de sub evento que es para procesos que ya se han completado
      // cuando el job se halla completado este evento ejecutara el remove para sacarlo del BullBoard
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      // se puede colocar "global:evento" o de forma desaclopada  "evento"
      // "global:completed" es un evento para cuando se halla completado pero que mostraara en este caso unos logs
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      // "global; stalled" evento para procesos que estan atascado o aun no se han resuelto

      // si pasa esto se pasa un log para avisar
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  // funciones con accesibilidad protected para que solo las clases hijas heredadas de esta clase abstracta puedan acceder a este metodo

  // funcion para agregar un job
  protected addJob(name: string, data: IBaseJobData): void {
    // el metodo "add" de queue crea un nuevo job y lo agrega a la cola
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
    // este add espera 3 parametros, 1ro el nombre de la cola, 2do la data que tendra el queue y 3ro un opciones
    // el cual "attemps" es el numero de intentos que tendra un job para completarse en este caso 3 intenttos
    // 'backoff" es una opcion de configuracion para cuando el job falle, haga ciertas cosas en este caso "fixed" para que solucione el problema y "delay" es el tiempo que se le dara a cada intento
  }

  // funcion para procesar un job
  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
    // el metodo "process" de queue es una funcion que es para definir los procesos  de un job
    // esta necesita 3 parametros, 1ro nombre del queue, 2do concurrency el cual sera el numero de workers que tendra para resolver la tarea
    // el 3ro es un callback el cual se pasara y esta sera la tarea a realizar
  }
}
