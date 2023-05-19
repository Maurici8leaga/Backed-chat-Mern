import { BaseCache } from './base.cache';
import { IUserDocument } from '@user/interfaces/userDocument.interface';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { ServerError } from '@helpers/errors/serverError';
import { Generators } from '@helpers/generators/generators';

// se crea este log de tipo Logger de bunyan, para tener una trazabilidad. y con logger de nuestros configs nos mostrara
// esa traazabilidad . el nombre de los logs que ocurran aqui llevaran el nombre de "userCache"
const log: Logger = logger.createLogger('userCache');

// se crea una clase con herencia de la clase abstracta de base.cache
export class UserCache extends BaseCache {
  constructor() {
    // "userCache" sera el nombre de la cache
    super('userCache');
  }

  // se crea una funcion  para almacenar los usuarios en la cache para luego tenerlos disponibles
  public async saveToUserCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    // se le pasan unos parametros a esta funcionn el cual son; "key" para redis debe pasarse una key el cual sera el indentificador
    // de un comentario, post, etc. "userUId" el cual sera el identificacion del usuario y por ultimo "createdUser" seran los datos
    // del usuario asociado a esta cache

    const createdAt = new Date(); //se usa Date para tener la fecha del momento

    // destructuracion de los parametros que vienen dentro de createdUser
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      social,
      work,
      location,
      school,
      quote,
      bgImageVersion,
      bgImageId
    } = createdUser;

    // para mandar la documentacion de un user redis necesita que este en un formato string. ESTO SIEMPRE SE DEBE HACER
    const dataToSave = {
      // aqui adentro iran los parametros en formato string que se le pasaran a redis
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked), // se debe usar JSON.stringify ya que ellos son un arrays de objectID, Y POR ESE formato hay que pasarlo a string
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    };

    try {
      // verificar que redis este arrriba
      if (!this.client.isOpen) {
        // isOpen es un metodo de redis, el cual indica si la sesion de redis esta activa
        await this.client.connect(); //si no lo esta entonces con connect() se llamara
      }

      // configuracion para guardar el usuario en la cache
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      // "this.client" viene de BaseCache
      // el metodo "ZADD" es un metodo de redis para agregar, el cual espera unos parametros el cual son:
      // 1ro es una key "user" es el nombre de la key que tendra el nombre de la coleccion en redis, es como los nombres de los schemas
      // 2do ZOptions el cual es un objeto que dentro de el va un parametro llamado "score" el cual vendra siendo el identificador
      // del usuario dentro de la cache. para pasarle este identificador se debe usar "parseInt" que convierte el numero pasado en numero entero de base 10
      //  y por ultimo parametro value para agregar los indetificadores de los keys con sus datos

      // se crea este loop para procesar los datos a la coleccion de "user"
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        // añadimos el user a la colleccion creada anteriormente
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
        // metodo "HSET" sirve para modificar o actualizar en este caso la colleccion de la cache, el cual como parametro se le paasa
        // primero el key del user para que sepa que user esta guardando, y sus daatos con su vaalor "itemKey" y "itemValue"
      }
    } catch (error) {
      // en caso de haber problema con el log se manda un mensaje de error con el error
      log.error(error);
      throw new ServerError('Server Redis error. Try again.');
    }
  }

  // se crea un metodo publico para poder optener el user de la cache despues de haberse guardado
  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      // verificar que redis este arrriba
      if (!this.client.isOpen) {
        // isOpen es un metodo de redis, el cual indica si la sesion de redis esta activa
        await this.client.connect();
      }

      // OJO para usar esta data de la cache hay que parsearla

      // se crea una variable de tipo "IUserDocument" para que en ella se alamacenen los datos del user a traer
      // se usa "await" ya que hay que esperar que el cliente de redis se resuelva
      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      // HGETALL permite traer un key (user) de la lista, el cual se tiene que especificar
      // se coloca entre parentesis y se pasa como "as unknow" porque la estructura te pide que sea asi para que luego se pase a la estructura deseada en este caso "IUserDocument"
      response.createdAt = new Date(Generators.parseJson(`${response.createdAt}`));
      // con el metodo de "Generators parseJson" pasamos el formato que viene de la cache para poder usarla
      response.postsCount = Generators.parseJson(`${response.postsCount}`);
      response.blocked = Generators.parseJson(`${response.blocked}`);
      response.blockedBy = Generators.parseJson(`${response.blockedBy}`);
      response.notifications = Generators.parseJson(`${response.notifications}`);
      response.social = Generators.parseJson(`${response.social}`);
      response.followersCount = Generators.parseJson(`${response.followersCount}`);
      response.followingCount = Generators.parseJson(`${response.followingCount}`);
      response.bgImageId = Generators.parseJson(`${response.bgImageId}`);
      response.bgImageVersion = Generators.parseJson(`${response.bgImageVersion}`);
      response.profilePicture = Generators.parseJson(`${response.profilePicture}`);
      response.work = Generators.parseJson(`${response.work}`);
      response.school = Generators.parseJson(`${response.school}`);
      response.location = Generators.parseJson(`${response.location}`);
      response.quote = Generators.parseJson(`${response.quote}`);

      return response;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }
}
