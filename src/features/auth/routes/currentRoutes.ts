import express, { Router } from 'express';
import { authMiddleware } from '@helpers/middlewares/auth-middleware';
import { CurrentUser } from '@auth/controllers/currentUser';

class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentUser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);

    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
