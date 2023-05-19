import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@configs/configEnv';
import { NotAuthorizedError } from '@helpers/errors/notAuthorizedError';
import { AuthPayload } from '@auth/interfaces/authPayload.interface';

// se crea AuthMiddleware ya que como estamos en POO se crea una clase que dentro de ella se coloque los distintos middlewares que seran metodos de la misma
export class AuthMiddleware {
  // metodo publico para verificar el usuario
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      // "req.session" apunta a la cookie donde ahi esta la info del user que esta tratando de entrar, si en esta session esta el jwt
      // el user podra pasar pero si no entonces...
      throw new NotAuthorizedError('Token is not available. Please login again.');
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload; // "config.JWT_TOKEN! " este ! es por que es propiedad requerida y con valor implicito
      // "verify" del JWT es para decodificar el token y verificar si es correcto el token o no, como parametro se le pasa
      // 1ro el token de la session entrante y  2do el secret key para desencriptarla y asi poder verificar
      req.currentUser = payload;
      // "req.currentUser" es para que despues de haberse autenticado este ya tenga ese valor y no tenga que volverse a repetir el proceso
    } catch (error) {
      // si el token fue modificado y no coincide entonces
      throw new NotAuthorizedError('Token is invalid. Please login again.');
    }
    next();
  }

  // metodo para verificar si el usuario ya se authentico
  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route.');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
// se crea la instancia de las clase
