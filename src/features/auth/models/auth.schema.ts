import { hash, compare } from 'bcryptjs';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { model, Model, Schema } from 'mongoose';
// import { config } from '@configs/configEnv';
// model: es una funcion que resuelve la creacion de shcema del modules
// Model: es una interfaz

// se crea una instancia de Schema para los auths
//aqui se implementa Design Pattern AAA / Security for Design (SBD): https://www.ticportal.es/glosario-tic/seguridad-diseno-sbd
// ya que se le limita el schema la data que pueda tener para asi poder restringir y no exponer informacion importante como el password
const authSchema: Schema = new Schema(
  {
    username: { type: 'String' },
    uId: { type: 'String' },
    email: { type: 'String' },
    password: { type: 'String' },
    avatarColor: { type: 'String' },
    createdAt: { type: Date, default: Date.now() },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    // despues de declarar los args que llevara el schema se puede agrega, unas ciertas configuracion a algun parametro, por ejemplo;
    toJSON: {
      // es una propieda de opcion de schemas, el cual tiene opciones
      // esta funcionalidad se van a ejecutar cuando el se dectecte un json de este schema

      transform(_doc, ret) {
        // es una funcion para transformar el metodo de schema, el cual necesita 2 parametros 1ro hace referencia al documento
        // 2do son la estructura del documento el cual viene siendo las propiedades que tenga

        // usamos delete para eliminar del json el password. esto es parte del desing pattern AAA
        delete ret.password;
        return ret; // se retorna el resto de los parametros del json
      }
    }
  }
);

// virtual methods / spaces methods .. son definiciones o metodos espaciales que son logicas que rodean al schema

// authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
//   // "pre" es una metodo previo del schema, y "save" es lo que indica cuando se aplicara esta funcionalidad en este caso al hacer save
//   const hashedPassword: string = await hash(this.password as string, Number(config.SALT_ROUND));
//   // hash de bcrypt encriptara ell password , el cual necesita 2 parametros 1ro el password y el 2do el numero de SALT para hacer la encriptacion con un random string
//   // OJO el password debe ser pasado como string
//   this.password = hashedPassword; //se le da el pasasword encriptado al schema de esta forma
//   // el this hace referencia al "authSchema"
//   next(); // despues de terminar se llama a saltar a otro proceso
// });

// para crear los propios metodos de consulta se usa:  "nombreSchema"+methods+."nombredelmetodo"
authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  // se usa async ya que estos metodos deben esperar que exista y se resuelva el schema para poder ejecutarse
  const hashedPassword: string = (this as IAuthDocument).password!; //se coloca ! en ".password!" porque necesita que sea un string
  return compare(password, hashedPassword);
  // compare de bcrypt comparara el password introducido con el ya guardado,
};

// authSchema.methods.hashPassword = async function (password: string): Promise<string> {
//   // apesar que se usa async function en estos casos no es necesario usar el await
//   return hash(password, Number(config.SALT_ROUND));
//   // este metodo al llamarse retornara el password hasheado
// };

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');
//model espera 3 argumentos el cual es, 1ro el nombre que llevara el schema y se conocera con las demas
// el 2do es el schema creado, 3ro es la coleccion de la db
export { AuthModel }; //se conectan con las otras collecciones implicitamente atraves de mongo
