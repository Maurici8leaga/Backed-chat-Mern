import { Request, Response } from 'express';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { serverAdapter } from '@services/queues/base.queue';
// serverAdapter es el disponibiliza las colas en las rutas y asi poder verlo en el dashboard
import { config } from '@configs/configEnv';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@helpers/middlewares/auth-middleware';

// funcion anonima que contendra las rutas princiapales a exposicion
export default (app: Application) => {
  // app:Application es para disponibilizar las rutas a express
  const routes = () => {
    //aqui se implementa (Patron Chain of Responsibility)

    // esta ruta es para solo verificar que el server este OK
    app.use('/healtcheck', (_req: Request, res: Response) => res.send('Server is OK!'));

    // esta ruta es para levantar el dashboard y ver los procesos de las colas
    app.use('/queues', serverAdapter.getRouter());
    // "getRouter" esta funcion es de expres el cual es para optener la rutas

    // esta ruta es para el signup y singin
    app.use(config.BASE_PATH!, authRoutes.routes()); //se le agrega el "!" para asegurar que el type que devuelva BASE_PATH sea "pathParams"
    // "authRoutes.routes()" sera la ruta hija

    // esta ruta es para el signout
    app.use(config.BASE_PATH!, authRoutes.signoutRoute());
    // "authRoutes.signoutRoute()" sera la ruta hija

    // esta ruta es para obtener el profile del user
    app.use(config.BASE_PATH!, authMiddleware.verifyUser, currentUserRoutes.routes());
    // esta ruta tiene 2 middleware, 1ro "verifyUser" es para verificar el user y su token
    // si pasa ese entonces continua el 2do el cual es la ruta hija
    // esto es un principio SOLID
  };
  routes(); //se debe llamar la funcion
};
