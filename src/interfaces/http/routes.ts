import { Request, Response } from 'express';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { serverAdapter } from '@services/queues/base.queue';
import { config } from '@configs/configEnv';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@helpers/middlewares/auth-middleware';

export default (app: Application) => {
  const routes = () => {
    app.use('/healtcheck', (_req: Request, res: Response) => res.send('Server is OK!'));

    app.use('/queues', serverAdapter.getRouter());

    app.use(config.BASE_PATH!, authRoutes.routes());

    app.use(config.BASE_PATH!, authRoutes.signoutRoute());

    app.use(config.BASE_PATH!, authMiddleware.verifyUser, currentUserRoutes.routes());
  };
  routes();
};
