// esta es una abstraccion de codigo de servicios de DB que va en los controladores , PERO por la arquitectura ONION
// se crea esta carpeta de db y se abstrae la logica de esta forma
import { IUserDocument } from '@user/interfaces/userDocument.interface';
import { UserModel } from '@user/models/user.schema';
// se importa UserModel para poder realizar las consultas a la DB
import mongoose from 'mongoose';

class UserService {
  // funcion asincrona para crear un usuario, es asincrona ya que los metodo de mongoose son asincronos
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
    // el metodo "create" es de mongoose,  el permite crear un documento en la DB
  }

  // funcion asincrona  para buscar usuario por id,  es asincrona ya que los metodo de mongoose son asincronos
  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      // el metodo "aggregate" de mongoose es un metodo de consulta el cual permite, fusionar, trasformar y combinar datos de varias colecciones para devoler un solo resultado
      // "aggregate" es un pipeline el cual significa que es una serie de procesamientos de datos para procesar grandes cantidades de datos
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      // con el operador de mongoose "$match" el buscara el user por el id
      // se usa "new mongoose.Types.ObjectId" para convertir la propiedad "userId" en objectid  ya que ella es numero normal
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      // operador "$lookup" el apunta una referencia a otro document segun las especificaciones, en este caso es la coleccion donde queremos obtener la informacion
      // "from" es la referencia del documento a donde se quiere apuntar para traer la info", este caso el schema de "Auth"
      //  "localField" es el propiedad de ese documento donde se va apuntar, se escoje esta ya que es  un objectId
      //  "foreignField" es el indentificador del documento es el id que crea mongodb por documento
      // el "as" es el alias que quiere que lleve ese proceso de solucitud de documento, el nombre es libre a colocar
      { $unwind: '$authId' }, //metodo "$unnwind" es un objeto que se crea de una referencia de otro objeto en este caso del "authId"
      { $project: this.aggregateProject() }
      // el metodo "$project" es el paso final del pipeline el cual devuelve los datos que queremos, excluya  los que queremos y asi
      // en este caso se creo una funcion externa para hacerlo mas ordenado
    ]);
    return users[0]; //para devolver el 1er elemento del array el cual sera la info relevante
  }

  // otra forma de hacerlo con populate
  /*public async getUserByIdWithPopulate(userId: string): Promise<IUserDocument> {
    const user: IUserDocument = await UserModel
      .findOne({ _id: new mongoose.Types.ObjectId(userId) })
      .populate('authId', { username: 0, email: 0 }) as IUserDocument;
      return user;
  }*/

  // se crea una funcion para en ella especificar los datos que queremos
  private aggregateProject() {
    return {
      // como esto vaa dentro del metodo "$project" para los elementos que si queremos se coloca  1 y para los que sean ignorados 0
      // si el dato no es del mismo schema se debe hacer una   expecificacion
      _id: 1,
      username: '$authId.username', //ya que este dato no es del mismo schema se usa el "authId" que es el objeto de unwind y dentro de este objeto accedemos a  la propiedad
      uId: '$authId.uId', // esto se hace para combinar informacion de distinto schemas , lo que llevan 1 o 0 vienen del schema de user
      email: '$authId.email', //y estos viene de los schemas de "Auth"
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}

export const userService: UserService = new UserService();
