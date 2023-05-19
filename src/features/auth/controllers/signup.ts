// los controladores son donde va la logica de negocios
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@services/db/auth.service';
import { UserCache } from '@services/redis/user.cache';
import { BadRequestError } from '@helpers/errors/badRequestError';
import { Generators } from '@helpers/generators/generators';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@helpers/cloudinary/cloudinaryUploads';
import { IUserDocument } from '@user/interfaces/userDocument.interface';
import { omit } from 'lodash';
// lodash es para dar mejor modularididad y mejor performance
import { userQueue } from '@services/queues/user.queue';
import { authQueue } from '@services/queues/auth.queue';
import HTTP_STATUS from 'http-status-codes';
import { SignUpUtility } from './utilities/signup.utility';
import { config } from '@configs/configEnv';

const userCache: UserCache = new UserCache();

export class SignUp extends SignUpUtility {
  // asi se usa el decorador de joi
  @joiValidation(signupSchema) // joiValidation es para validar los parametros del request

  // se crea esta funcion para crear el usuario  por 1era vez
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist = await authService.getUserByUsernameOrEmail(username, email);
    // se usa el metodo "getUserByUsernameOrEmail" de authService para buscaar el usuario
    if (checkIfUserExist) {
      // si existe se mandara un mensaje de error
      throw new BadRequestError('Invalid credentials for this user');
    }
    //se crea un objectId para ciertas propiedades
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();

    // se crea un id de base 12 con el metodo que se creo dentro de los "Generators"
    // el cual sera el identificador de redis en el score, por ende sera el numero indentificador en la cache
    const uId = `${Generators.generateRandomIntegers(12)}`;

    // passwordHash sera el password del usuario encryptado
    const passwordHash = await Generators.hash(password);
    // se aplica el generador aqui para que apenas se cree se encrypte el passwordd tanto en la cache de redis como en laa DB

    const authData: IAuthDocument = SignUp.prototype.signUpData({
      // se llama el metodo creado en el file signup.utility "signUpData"
      // IMPORTANTE se debe usar este metodo "SignUp.prototype.signUpData" y no con el this, ya que cuando se agregue esto en la ruta el express no reconocera el metodo con el this
      // en cambio con prototype reconocera que es un metodo que existe de la clase abstracta SignUpUtility
      _id: authObjectId, //se pasa  el id creado arriba
      uId, //se pasa el uId creado arriba
      username,
      email,
      password: passwordHash,
      avatarColor
    });

    // uploads to cloudinary
    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`)) as UploadApiResponse; //se pasa como as "UploadApiResponse" yaa que la estructura pide ser pasada asi
    // se crea una variable de tipo "UploadApiResponse" el cual es una interfaz de cloudinary
    // se usa await ya que "uploads" devuelve un promise, esta funcion se le pasa 2 parametros,
    // 1ro importante es el file que seraa la imagen del usuario, 2do es un id ya que cada imagen debe tener un id identificador

    if (!result?.public_id) {
      // de no haber un "userObjectId" mostrara un error
      throw new BadRequestError('File upload: Error ocurred. Try again.');
    }

    // Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    // se llama el metodo creado en el file signup.utility "userData"
    // IMPORTANTE se debe usar este metodo "SignUp.prototype.userData" y no con el this, ya que cuando se agregue esto en la ruta el express no reconocera el metodo con el this
    // en cambio con prototype reconocera que es un metodo que existe de la clase abstracta SignUpUtility
    userDataForCache.profilePicture = `${config.CLOUD_DOMAIN}/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
    // aqui le estamos dando el valor a la imagen del usuario que vendra de cloudinary
    // donde dice "CLOUD_DOMAIN" va el link de cloudinary y donde dice "CLOUD_NAME" va el nombre de la cuenta de cloudinary
    // /image/upload/ debe ir siempre, seguido de la version y su objectId del usuario quien la subio
    // en result.version se encuentra el la version del idenficador de la imagen
    await userCache.saveToUserCache(`${userObjectId}`, uId, userDataForCache); //se usa await ya que la funcion "saveToUserCache" devuelve un promise
    // la funcion "saveToUserCache" es para guardar el user en la cache de redis donde se le pasa el key para redis
    // el identificador del usuario y la data del user

    // Add to database
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    // el "omit" de lodash se usa para omitir los datos dentro del array ya que pertenece a otro schema y no necesitamos eso, ya que nosotros aqui nos interesa los datos que estan dentro del array

    // aqui se usan los jobs de worker para hacer ciertos jobs
    authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForCache }); //se pasa como value el userDataForCache porque en ella esta contenida el "authData" y su objectId, ademas que esta guardada en la cache
    // "addAuthUserJob" es el job para agregar el los datos del auth del user al DB, el cual se le pasa el nombre del job y luego la data que se va a guardar
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });
    // "addUserJob" es el job para agregar los datos del user al DB, el cual se le pasa el nombre del job y luego la data que se va a guardar

    //  asignacion del token al user
    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    // se llama el metodo creado en el file signup.utility "signToken"
    // IMPORTANTE se debe usar este metodo "SignUp.prototype.signToken" y no con el this, ya que cuando se agregue esto en la ruta el express no reconocera el metodo con el this
    // en cambio con prototype reconocera que es un metodo que existe de la clase abstracta SignUpUtility
    req.session = { jwt: userJwt }; // este "req.session" pertenece al patron doble token security
    // de esta forma se le esta dando a la session del user el token

    res
      .status(HTTP_STATUS.CREATED) //se le pasa un status de creado el cual es 201
      .json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
    // por ultimo se envia un json con un mensaje, mas la data del user y el token que tendra para iniciar session
  }
}
