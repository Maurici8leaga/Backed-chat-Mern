// los controladores son donde va la logica de negocios
import { Request, Response } from 'express';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/userDocument.interface';
import { userService } from '@services/db/user.service';
import HTTP_STATUS from 'http-status-codes';

// se crea una instancia de UserCache para poder usar sus metodos
const userCache: UserCache = new UserCache();

export class CurrentUser {
  // funcion para obtener el perfil del usuario que esta actualmente conectado
  public async read(req: Request, res: Response): Promise<void> {
    // variables con valores por default para definir la estructura de mensaje
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument; //se encierra en parentesis para asegurar que cumpla con la estructura de "IUserDocument"
    // el metodo 'getUserFromCache' de userCache es para obtener un usuario por su ID de la cache
    // "currentUser" es un metodo que creamos de difinicion global, y userId es el id sel usuario el cual 'getUserFromCache' espera encontrar

    // esta va a ser una variable en la que se va almacenar los datos del user, el cual vendra de 2 lugares, o de la cache o del DB
    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser!.userId}`);
    // "userService" es una clase de la DB y su metodo "getUserById" es para optener user por id de la DB

    if (Object.keys(existingUser).length) {
      // con "Object.keys" y su length verificamos que si "existingUser" logro recuperar el usuario y tiene sus propiedades entonces...
      isUser = true;
      token = req.session?.jwt; //el signo ? en req.session ? es para preguntar por esa propiedad, si lo tiene lo guarda
      user = existingUser;
    }
    // si todo se cumple , se envia los datos
    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
