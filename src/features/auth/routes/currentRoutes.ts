import express, { Router } from 'express';
import { authMiddleware } from '@helpers/middlewares/auth-middleware';
import { CurrentUser } from '@auth/controllers/currentUser';

// este es el class donde va  a ir la ruta hija para perfil del user
class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    // "express.Router" es para crear una instancia de un enrutador, el cual administrara las rutas de este class
  }

  // aqui adentro es donde ira la ruta hija para el perfil del user
  public routes(): Router {
    this.router.get('/currentUser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);
    // esta ruta tiene 2 middleware, 1ro "checkAuthentication" es para verificar que el user ya este autenticado y tenga token
    // si pasa ese entonces continua el 2do el cual es el controlador para obtener los datos del user
    // "CurrentUser.prototype.read" es una copia o referencia del contexto de la funcion que esta dentro de la clase CurrentUser ya que express no reconoce el metodo de read directamente
    // esto es un principio SOLID

    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
