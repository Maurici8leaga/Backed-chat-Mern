import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import Logger from 'bunyan';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { config } from '@configs/configEnv';
import { logger } from '@configs/configLogs';
import { IErrorResponse } from '@helpers/errors/errorResponse.interface';
import { CustomError } from '@helpers/errors/customError';
import applicationRoutes from '@interfaces/http/routes';

const log: Logger = logger.createLogger('server');

export class ChatServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    // estos son los middlewares
    app.use(compression()); //"compression" para comprimir la data
    app.use(json({ limit: '50mb' })); //se le pasa como parametro adicional el peso maximo que debe tener estos archivos
    // se usa "json()" para parsear el contenido del server ya que ya no se usa "bodyParser.json()"
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    // el "urlencoded" asegura que el formato venga  en el que se indico en este caso tipo "json"
    // el parametro "extended" encripta la data que venga en el archivo
    // y como 2do parametro se le pasa "limit" para que el peso del archivo no supere del indicado
  }

  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    // este middleware es para las rutas que no existan
    app.all('*', (req: Request, res: Response) => {
      // app.all("*") para todas las rutas en express el * tomará todas las definiciones a partir de las rutas que existentes cuando definas tus rutas de la app.. entonces a partir de las creadas, tomará las que no esten
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
      // esto mandara con un status 404 y un mensaaje con la ruta a la que se esta tratando de acceder diciendo not found
    });

    // este middleware es para las rutas que si existan
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      // el "_" del req se coloca ya que es un parametro que debe ir pero no es usado
      // aqui se usa la interfaz "IErrorResponse" para el manejo del mensaje del error

      // se coloca un log para tener la trazabilidad del error
      log.error(error);
      if (error instanceof CustomError) {
        // se usa el "instanceof" para verificar que si el error es de clase "CustomError" entonces haga..
        return res.status(error.statusCode).json(error.serializeErrors());
        // se va a enviar el status code con un json de estructura del "serializeErrors"
      }
      next(); // se llama next para que si termino el proceso salte a otro proceso
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    // este metodo necesita como pararmetro pasar un server, el cual retornara una promesa de Server de Socket

    // se crea una instancia de Server de Socket , el cual el 1er parametro es httpServer y 2do son config de cors
    const io: Server = new Server(httpServer, {
      // cada servidor debe manejar por separado su contexto de cors, por eso se debe volver a colocar los parametros de cors
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    // se crea un cliente con "createClient" de redis para poder emitir los sockets con direccion del redis
    const pubClient = createClient({ url: config.REDIS_HOST });
    // y se crea el subClient el cual estara anclado a pubClient
    const subClient = pubClient.duplicate();
    // ya que retorna una promesa se debe esperar que se resuelva, y dentro se llama pubClient y subClient para que se conecte
    await Promise.all([pubClient.connect(), subClient.connect()]);
    // se debe colocar un adaptador el cual se crea con un cliente y el subCliente para que puedan establecer una conexion
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private socketIOConnections(io: Server): void {
    console.log(io);
    log.info('SocketIO Connections Ok.');
  }

  private startHttpServer(httpServer: http.Server): void {
    const PORT = Number(config.SERVER_PORT);

    httpServer.listen(PORT, () => {
      log.info(`Server has started with process ${process.pid}.`);

      log.info(`Server running at ${PORT}.`);
    });
  }
}
