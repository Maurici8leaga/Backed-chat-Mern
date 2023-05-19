import { Request, Response } from 'express';
import moment from 'moment';
import publicIp from 'ip';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
// es una interfaz de programación de aplicaciones (API) que proporciona funcionalidades de criptografía para Node.js.
import { config } from '@configs/configEnv';
import { authService } from '@services/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { joiValidation } from '@decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemes/emailAndPassword';
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template';
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template';
import { emailQueue } from '@services/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/resetPassword.interface';
import { BadRequestError } from '@helpers/errors/badRequestError';
import { Generators } from '@helpers/generators/generators';

export class Password {
  // asi se usa el decorador de joi
  @joiValidation(emailSchema) // joiValidation es para validar los parametros del request

  //funcion asincrona para reiniciar el password del user
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    // se usa el metodo 'getAuthUserByEmail' para verificar si el usuario ya existe en la DB
    if (!existingUser) {
      // si no existe usuario con ese email entonces...
      throw new BadRequestError('Invalid credentials');
    }

    // cryptography
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(Number(config.RANDOM_BYTES))); // ej: <Buffer a5 8b b5 73 55 8a 77 8c 6a 5a 9a ff 4a 6e 7f a3 f3 17 5f 4e>
    // el nombre "randomByttes" lo recomienda crypto y es de tipo "Buffer" que es nativo de crypto, el cual en ella ira una serie de numeros cifrados
    // con "randomBytes" y el numero especificado genera criptografia del largo del numero que se coloque
    const randomCharacters: string = randomBytes.toString('hex'); // ej: a58bb573558a778c6a5a9aff4a6e7fa3f3175f4e representa una cadena con números del 0-9 y de la a-f
    // este "randomCharacters" contendra los randomBytes pero en formato hexadecimal y de tipo string para que sea token
    // DATO SE SUELE USAR EL HEXADECIMAL PARA ESTO

    // set el token  y su duracion para resetiar el password
    await authService.updatePasswordToken(`${existingUser._id}`, randomCharacters, Date.now() * 60 * 60 * 1000);
    // el metodo "updatePasswordToken" actualizar el token para resetiar el password del user el cual espera el, id del  user, el token y el tiempo
    // Date.now() * 60 * 60 * 1000 es para el tiempo de expiracion del token esa es una combinacion para que dure 1h
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    // este sera la direccion del user que es desde el front mas el token de este reset
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
    // el metodo de "passwordResetTemplate" renderiza el template con el username y el link como parametros

    // se crea el job para el envio del email
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
    //se envia el resultado de lla funcion con un status y un json
  }

  @joiValidation(passwordSchema) // joiValidation es para validar los parametros del request

  // funcion asincrona para actualizar el passwordd del user
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const passwordHash = await Generators.hash(password); // se encripta el password nuevo
    const { token } = req.params;
    // manejo opcional si no tuvieras el esquema de def. abstraído (joi)
    if (password !== confirmPassword) {
      // en caso de no coincidir...
      throw new BadRequestError('Passwords do not match');
    }

    // se busca el user por el token
    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (!existingUser) {
      // en caso de que el user no exista...
      throw new BadRequestError('Reset token has expired or invalid.');
    }

    existingUser.password = passwordHash; //se le agrega el nuevo pasasword al user
    existingUser.passwordResetExpires = undefined; //se le quita el token para el reset
    existingUser.passwordResetToken = undefined; //se le quita el token para el reset
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIp.address(), //con el metodo "address" de publicIp se puede optener el ip del usuario
      date: moment().format('DD/MM/YYYY HH:mm') //se usa moment para modificar el formato y colocar el deseado
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // el metodo de "passwordResetConfirmationTemplate" renderiza el template

    // se crea el job para el envio del email
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password Reset Confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated. ' });
    //se envia el resultado de lla funcion con un status y un json
  }
}
