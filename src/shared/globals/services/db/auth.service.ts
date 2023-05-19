// esta es una abstraccion de codigo de servicios de DB que va en los controladores , PERO por la arquitectura ONION
// se crea esta carpeta de db y se abstrae la logica de esta forma
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { AuthModel } from '@auth/models/auth.schema';
// se importa AuthModel para poder realizar las consultas a la DB
import { Generators } from '@helpers/generators/generators';

//aqui se implementa principio SOLID open / close y single  responsability, ya que las funcionales de esta clase pueden expanderse en variedad
class AuthService {
  // funcion asincrona para crear un usuario, es asincrona ya que los metodo de mongoose son asincronos
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
    // el metodo "create" es de mongoose,  el permite crear un documento en la DB
  }

  // funcion asincrona para buscar un usuario por email o username, es asincrona ya que los metodo de mongoose son asincronos
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    // esta funcion espera si o si 2 parametros, username y emaill

    // query sera el argumento a pasar para la busqueda
    const query = {
      // el operador logico "$or" es un operador de mongoDB, retorna el documento que coincida con la condicion pasada, este caso
      // o el email o el username
      $or: [{ username: Generators.firstLetterUppercase(username) }, { email: Generators.lowerCase(email) }]
      // el metotdo "firstLetterUppercase" del Generators colocara la primera letra en mayuscula y las demas en minuscula
      // y en el caso de "lowerCase" todo en minuscula
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    // el metodo "findOne" es de mongoose, el cual sirve para encontrar un documento pasandole query el cual sera un argumento de este documento
    // exec() es una funcion para especificacion de que la query se ejecuto
    // se envuelve todo en parentesis para que cumpla con el contrato y tenga una estructura como la de "IAuthDocument"

    return user;
  }

  // funcion asincrona para buscar un usuario por su username, es asincrona ya que los metodo de mongoose son asincronos
  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      username: Generators.firstLetterUppercase(username)
    }).exec()) as IAuthDocument;
    return user;
  }

  // funcion asincrona para buscar un user por su email, es asincrona ya que los metodo de mongoose son asincronos
  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Generators.lowerCase(email)
    }).exec()) as IAuthDocument;
    return user;
  }

  // funcion asincrona para actualizar el token para resetiar el password del user
  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne(
      //updateOne es un metodo de consulta de mongoose para actualizar un campo , el 1er argumento es el cual buscara, y el 2do argumento sera el que actualizara
      { _id: authId }, //lo encontrara por el authId del user
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    );
  }

  // funcion asincrona para optener el user por el token del password
  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() } //el operador "$gt" es grater than, para valor mayores que, en este caso para si supera la fecha en lla que se genera
    }).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
