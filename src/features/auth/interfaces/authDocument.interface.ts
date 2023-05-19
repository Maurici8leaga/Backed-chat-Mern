// TODO LAS INTERFACES QUE TERMINEN CON JOB SON PARA LOS WORKERS
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

// se crea un interfaz con extension de Document de mongoose para que tenga la estructura de esa interfaz de Document
export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string; // este es un identificador para procesos de cache
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>; //estos seran un metodos que comparara los passwords a la hora de autenticar el user
}
