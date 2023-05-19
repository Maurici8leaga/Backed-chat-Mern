// los controladores son donde va la logica de negocios
import { Request, Response } from 'express';
import { config } from '@configs/configEnv';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@decorators/joi-validation.decorators';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@helpers/errors/badRequestError';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';

export class SignIn {
  // asi se usa el decorador de joi
  @joiValidation(loginSchema) // joiValidation es para validar los parametros del request

  // funcion para iniciar sesion del usuario
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    // se usa el metodo "getUserByUsernameOrEmail" de authService para buscaar el usuario

    if (!existingUser) {
      // si existe se mandara un mensaje de error
      throw new BadRequestError('Invalid credentials');
    }

    // variable que comprueba que coincida con la creada en la DB
    const passwordMatch: boolean = await existingUser.comparePassword(password); //el metodo "comparePassword" es de monngoose
    if (!passwordMatch) {
      // si el password no coincide mandara un mensaje de error
      throw new BadRequestError('Invalid credentials');
    }

    //  asignacion del token al user
    const userJwt: string = JWT.sign(
      // la funcion "sign" es para asignar un token, el cual espera 2 argumentos, 1ro la data del auth del user
      // 2do es un token secreto el cual esta en las variables de entorno
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    req.session = { jwt: userJwt }; // este "req.session" pertenece al patron doble token security
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingUser, token: userJwt });
    // por ultimo se envia un json con un mensaje, mas la data del user y el token que tendra para iniciar session
  }
}
