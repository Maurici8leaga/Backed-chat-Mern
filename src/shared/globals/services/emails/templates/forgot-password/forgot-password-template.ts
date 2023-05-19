// se crea un version en ts para poder renderizar el template
import fs from 'fs';
import ejs from 'ejs';
// ejs es una libreria que permite crear platillas html con js en el servidor

// el class es una abstraccion para no tener que colocar todo esto dentro del controlador que se vaya a implementar
class ForgotPasswordTemplate {
  // metodo para renderizar el template de reinicio del password
  public passwordResetTemplate(username: string, resetLink: string): string {
    // este metodo leera el template y renderiza el template
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf8'), {
      // el metodo "render" de ejs renderizara el template
      // fs es un modulo que permite interacturar con archivos del sistema, en este caso "readFileSync" leer el archivo del template
      // "_dirname" permite buscar desde la raiz del proyecto hasta el directorio especificado

      // estos siguientes datos son lo que mostrara el template
      username,
      resetLink,
      image_url:
        'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
