// se crea un version en ts para poder renderizar el template
import fs from 'fs';
import ejs from 'ejs';
// ejs es una libreria que permite crear platillas html con js en el servidor
import { IResetPasswordParams } from '@user/interfaces/resetPassword.interface';

// el class es una abstraccion para no tener que colocar todo esto dentro del controlador que se vaya a implementar
class ResetPasswordTemplate {
  // metodo para renderizar el template de confirmacion de cambio de password
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'), {
      // el metodo "render" de ejs renderizara el template
      // fs es un modulo que permite interacturar con archivos del sistema, en este caso "readFileSync" leer el archivo del template
      // "_dirname" permite buscar desde la raiz del proyecto hasta el directorio especificado

      // estos siguientes datos son lo que mostrara el template
      username,
      email,
      ipaddress,
      date,
      image_url:
        'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
