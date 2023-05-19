import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
// este crea un objeto para exponer el API de Mail
import sendGridMail from '@sendgrid/mail';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { config } from '@configs/configEnv';
import { BadRequestError } from '@helpers/errors/badRequestError';

// se crea una variable el cual podra usarse para colocar los logs
const log: Logger = logger.createLogger('mailOptions');
// "mailOptions" es el nombre de referencia que se le dara a los logs que provengan de esta funcion

// configuracion obligatorioa de sendgrid
sendGridMail.setApiKey(config.SENDGRID_API_KEY!); // de esta forma queda setiado el api key

// IMailOptions es el contrato de estructura que tendran los email al momento de enviarse
interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  // "html" hace referencia al body del email
}

class MailTransport {
  // esta es una metodo publico para enviar el email
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    // como parametros espera la direccion de destino, asunto y el contenido

    // ya que se van a usar 2 libreria para los email el entorno va a definir con que libreria se va enviar el email
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      // si es de entorno de desarrollo o test seta con este que es de nodemailer
      this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      // si es de entorno de production sera con la libreria de sendgrid
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  // metodo privado para enviar el email con libreria de nodemailer
  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      // el metodo "createTransport" permite crear y configurar un objeto de transporte para enviar emails
      host: 'smtp.ethereal.email',
      // "host" si es en entorno desarrollo es donde ira los mail de prueba, es como un gmail
      port: 587, //si es un entorno de desarrollo este es el numero de puerto, si es de production cambia
      secure: false, //secure es false porque no estamos en entorno de producction por eso no usa SSL
      auth: {
        // aqui van los parametros de authenticion del user del account en este caso de prueba del ethereal
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!
      },
      tls: {
        rejectUnauthorized: false
        // permite enviar el correo sin haberse cumplido los parametros de auntenticacion, esto se coloca false para entornos de prueba pero por defecto viene como true
      }
    });

    // mail options object
    const mailOptions: IMailOptions = {
      from: `Chat App <${config.SENDER_EMAIL!}>`, //origen del email, se usa el de una pagina fake https://ethereal.email/create
      to: receiverEmail, //destino
      subject, //motivo
      html: body //contenido
    };

    // como es un proceso asincrono se necesita un try catch
    try {
      await transporter.sendMail(mailOptions);
      // transporter.sendMail es un metodo de Mail que sirve para enviar el correo
      log.info('Development email sent successfully.');
    } catch (error) {
      // si ocurrre un error se envia un log para la traza y otro para el servidor
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  // metodo privado para enviar el email con la libreria de sendgrid
  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    // se repite la misma estructura del mail
    const mailOptions: IMailOptions = {
      from: `Chat App <${config.SENDER_EMAIL!}>`, // luego cambiarlo a las credenciales de sengrid
      to: receiverEmail,
      subject,
      html: body
    };

    // como es un proceso asincrono se necesita un try catch
    try {
      await sendGridMail.send(mailOptions);
      // "send" es un metodo de sengrid para enviar el correo
      log.info('Production email sent successfully');
    } catch (error) {
      // si ocurrre un error se envia un log para la traza y otro para el servidor
      log.error('Error sending email ', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
