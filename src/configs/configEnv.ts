// Este file es para manejar de una forma organizadas las variables de entorno de la app BUENA PRACTICA
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config({});
// el metodo "config" de dotenv permite poder llamar las variables globales que se tengan en .el archivo .env y asi poder usarlas

class Config {
  // aqui iran toda las variables que existan en el file .env
  public DATABASE_URL: string | undefined;
  // creamos las propiedad publicas porque queremos poder acceder a ellas en otros lugares
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public SERVER_PORT: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public SALT_ROUND: string | undefined;
  public CLOUD_DOMAIN: string | undefined;
  public BASE_PATH: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;
  public SENGRID_SENDER: string | undefined;
  public RANDOM_BYTES: string | undefined;

  // inicializando las variables
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    // "process.env" es la que permite poder apuntar a esta variable
    this.JWT_TOKEN = process.env.JWT_TOKEN;
    this.NODE_ENV = process.env.NODE_ENV;
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE;
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.SERVER_PORT = process.env.SERVER_PORT;
    this.REDIS_HOST = process.env.REDIS_HOST;
    this.CLOUD_NAME = process.env.CLOUD_NAME;
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY;
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
    this.SALT_ROUND = process.env.SALT_ROUND;
    this.CLOUD_DOMAIN = process.env.CLOUD_DOMAIN;
    this.BASE_PATH = process.env.BASE_PATH;
    this.SENDER_EMAIL = process.env.SENDER_EMAIL;
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD;
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
    this.SENGRID_SENDER = process.env.SENGRID_SENDER || '';
    this.RANDOM_BYTES = process.env.RANDOM_BYTES;
  }

  // se crea un metodo publico para validar que estas variables de entorno no esten vacias
  // es  un metodo util de verificacion
  public validateConfig(): void {
    console.log(this);
    for (const [key, value] of Object.entries(this)) {
      // "key" para los nombres de las variables, "value" el valor que contienen
      if (value === undefined) {
        // se active un error por si la variable esta vacia
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
    // esto va a retornar un arrays de stings con su key y valor
  }

  // se crea un metodo publico para las configuraciones de cloudinary
  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      // el metodo config es de la version 2  de cloudinary necesita que se le pase  las credenciales, las cuales estan en las variables de entorno
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }
}

export const config: Config = new Config();
