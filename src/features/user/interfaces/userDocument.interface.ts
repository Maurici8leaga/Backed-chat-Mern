// estas es una abstraccion de una interfaz para ser implementada en otros files
import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { INotificationSettings } from './notificationSettings.interface';
import { ISocialLinks } from './socialLinks.interface';

// estas interfaces son como una puerta de acceso o de bloqueo, algo asi como una capa intermedia de cumplimiento de datos

// se crea una interfaz para definir la estructura de un models
// Principle SOLID: Interface Segregation
export interface IUserDocument extends Document {
  // se hereda Document de mongoose para que la interfaz tenga una estructura como la de mongoose

  _id: string | ObjectId; //el _id es un hash el cual colpassa el valor dentro de el, esto es de mongoose este se genera automatico()
  authId: string | ObjectId;
  username?: string;
  email?: string;
  password?: string;
  avatarColor?: string;
  uId?: string;
  postsCount: number;
  work: string;
  school: string;
  quote: string;
  location: string;
  blocked: mongoose.Types.ObjectId[]; //se usa "mongoose.Types.ObjectId[]" para cuando se vaya a fusionar este parametro con otro schema
  blockedBy: mongoose.Types.ObjectId[]; //en estos casos se suele crear una lista con otro schema
  followersCount: number;
  followingCount: number;
  notifications: INotificationSettings;
  social: ISocialLinks;
  bgImageVersion: string;
  bgImageId: string;
  profilePicture: string;
  createdAt?: Date;
}
