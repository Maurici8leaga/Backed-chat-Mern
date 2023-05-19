import { ObjectId } from 'mongodb';
import JWT from 'jsonwebtoken';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { config } from '@configs/configEnv';
import { ISignUpData } from '@auth/interfaces/signUpData.interface';
import { Generators } from '@helpers/generators/generators';
import { IUserDocument } from '@user/interfaces/userDocument.interface';

// se crea una clase abstracta para hacer una abstracccion de los metodos a implementar en signup.ts
export abstract class SignUpUtility {
  // se crea funcion para validar la entrada y salida de datos de auth del registro
  protected signUpData(data: ISignUpData): IAuthDocument {
    // "ISignUpData" ES EL CONTRATO que debe cumplir cuando se registre un usuario
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Generators.firstLetterUppercase(username), //se inserta el metodo para colocar la 1ra letra en mayuscula
      email: Generators.lowerCase(email), //se inserta el metodo para colocar todo en minuscula
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument; // se pasa el pasa "IAuthDocument" ya que la estructura espera que se cumpla el formato de la interfaz
  }

  // se crea esta funcion para validar la entrada y salida de datos del usuario en el registro
  protected userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      // esto van hacer los datos y campos del usuario despues de haberse registrado y iniciado sesion
      _id: userObjectId, // su id identificaador
      authId: _id,
      uId,
      username: Generators.firstLetterUppercase(username), //se coloca el username en Mayuscula
      email,
      password,
      avatarColor,
      profilePicture: '', //se le coloca por defecto el valor por defecto
      blocked: [], //se le coloca por defecto el valor por defecto
      blockedBy: [], //se le coloca por defecto el valor por defecto
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0, //se le coloca por defecto el valor por defecto
      followingCount: 0, //se le coloca por defecto el valor por defecto
      postsCount: 0,
      notifications: {
        //se le habilita los campos para que pueda tener acceso a estos
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        // se coloca los valores por defecto hasta que el usuario los llene
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument; // la estructura pide ser retornada como "IUserDocument" pero primero pide ser "unknown"
  }

  // firmar los datos de authentication para luego liberar el token
  protected signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      // la funcion "sign" es para asignar un token, el cual espera 2 argumentos, 1ro la data del auth del user
      // 2do es un token secreto el cual esta en las variables de entorno
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}
