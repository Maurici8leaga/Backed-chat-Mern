// los controladores son donde va la logica de negocios
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

export class SignOut {
  // esta funncion sera para desloguear el user
  public async update(req: Request, res: Response): Promise<void> {
    req.session = null; //se coloca null para eliminar el doble token authentication
    res.status(HTTP_STATUS.OK).json({ message: 'Logout successful', user: {}, token: '' });
    // por ultimo se envia un json con un mensaje, la data se deja vacia para no exponer los datos y se remueve el token para asi desloguearlo
  }
}
