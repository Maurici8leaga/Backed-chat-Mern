import express, { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { Password } from '@auth/controllers/password';

// en este class es donde van a ir las rutas hijas para el authentication
class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    // "express.Router" es para crear una instancia de un enrutador, el cual administrara las rutas de este class
  }

  // aqui adentro es donde ira la ruta hija para autenticaciones
  public routes(): Router {
    //aqui se implemtenta el desing pattern Mediator https://refactoring.guru/es/design-patterns/mediator
    // y tambien se implementa desing pattern Prototype https://refactoring.guru/es/design-patterns/prototype

    // esta sera una ruta post porque se mandara la info que esta registrando el user
    this.router.post('/signup', SignUp.prototype.create);
    // "SignUp.prototype.create" es una copia o referencia del contexto de la funcion que esta dentro de la clase SignUp ya que express no reconoce el metodo de create directamente

    // esta sera una ruta para iniciar sesion del user
    this.router.post('/signin', SignIn.prototype.read);
    //patron prototype & mediator ya que el ayuda a gestionar las solicitudes y actua como mediador para que se pueda cumplir los procesos
    // SignIn.prototype.read es el middleware de negocio de signin

    // esta sera una ruta para cuando el user olvide el passsword
    this.router.post('/forgot-password', Password.prototype.create);
    // "Password.prototype.create" es el middleware para reiniciar el password y crear uno nuevo

    // esta sera una  ruta para actualizar  el password
    this.router.post('/reset-password/:token', Password.prototype.update);
    // ":token" los 2 puntos es para agregar un query un valor dinamico al endpoint
    // "Password.prototype.update" es el middleware para actualizar el password

    return this.router;
  }

  // aqui adenntro es donde ira la ruta hija para desloguear
  public signoutRoute(): Router {
    // esta sera la ruta para desloguear al user, por ser de otro tipo de negocio va apartada de las de autenticaccion
    this.router.get('/signout', SignOut.prototype.update); //para desloguear se usa el protocolo GET no POST
    // SignOut.prototype.update es el middleware de negoccio de singout

    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
