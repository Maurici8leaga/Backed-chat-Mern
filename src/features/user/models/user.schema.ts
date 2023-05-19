import { IUserDocument } from '../interfaces/userDocument.interface';
import mongoose, { model, Model, Schema } from 'mongoose';
// model: es una funcion que resuelve la creacion de shcema del modules
// Model: es una interfaz

// se crea una instancia de Schema de mongoose para los user
const userSchema: Schema = new Schema({
  // aqui se definen los argumentos IMPORTANTES con su type
  // DATO YA QUE ESTA EN TYPESCRIPT NO SE COLOCA EL PARAMETRO REQUIRED PORQUE ESTA DEFINIDO EN LA INTERFAZ IUserDocument

  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }, //aqui se une el valor de este arg con el de un schema AUTH
  profilePicture: { type: String, default: '' }, //es buena practica colocar sus valores por default
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Number },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //se hace referencia al schema User el cual tendra un array de usuarios
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: {
    //un aargumentto puede tener otros argumentos dentros asi
    messages: { type: Boolean, default: true },
    rections: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  work: { type: String, default: '' },
  school: { type: String, default: ' ' },
  location: { type: String, default: '' },
  quote: { type: String, default: '' },
  bgImageVersion: { type: String, default: '' },
  bdImageId: { type: String, default: '' }
});

// UserModel sera el nombre de este Schema el cual sera de tipo IUserDocument
const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');
// el 1er parametro es el nombre de referencia que tendra en la colleccion de mongoose
// 2do parametro es el Schema
// 3er parametro en model<>() es para la referencia de como quiere ser llamado cuando sea implementado en otro schema, este es opcional ya que se usa solo cuando se va hacer referencia de ese schema en otros schemas
export { UserModel }; //se conectan con las otras collecciones implicitamente atraves de mongo
