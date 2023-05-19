import { Response } from 'express';
import { AuthPayload } from '@auth/interfaces/authPayload.interface';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { Iimage } from '@helpers/cloudinary/imageResult.interface';

// GIVEN STEP (PATRON)

// MOCK 1: REQUEST
export const authMockRequest = (
  sessionData: IJWT,
  body: IAuthMock,
  currentUser?: AuthPayload | null,
  params?: unknown
) => ({
  session: sessionData, //se necesita el token de la session
  body,
  currentUser,
  params //el params es de tipo "unknown" porque puede existir muchos tipos de parametros
});

// MOCK 2: RESPONSE
export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res); // simular el código de status
  // fn de jest crea un mock de una funcion
  res.json = jest.fn().mockReturnValue(res); // simularemos los datos con los retorne el json
  // mockReturnValue acepta un valor el cual sera retornado cuando el mock function es llamado
  return res;
};

// INTERFACES
export interface IJWT {
  // estructura con el token de la sesión
  jwt?: string;
}

export interface IAuthMock {
  // estructura de datos con datos que puedo enviar para diversos procesos de autenticación
  _id?: string;
  username?: string;
  email?: string;
  uId?: string;
  password?: string;
  avatarColor?: string;
  avatarImage?: string;
  createdAt?: Date | string;
  confirmPassword?: string;
}

// MOCK VALUES, (estos son los que  haran la data falsa para hacer los test)

// estructura de mock como datos a validar a partir de la sesión
export const authUserPayload: AuthPayload = {
  userId: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Yorman',
  email: 'yorman@gmail.com',
  avatarColor: '#9c27b0',
  iat: 12345
};

// estructura de mock como documento
export const authMock = {
  id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Yorman',
  password: 'yordev',
  email: 'yorman@gmail.com',
  avatarColor: '#9c27b0',
  createdAt: new Date(),
  save: () => {}
  // el metodo save es heredado de Document, el cual hara la simulacion de guardar la data en el DB
} as unknown as IAuthDocument;

// estructura de dato que se genera del usuario una vez de autentica, por ej: en signup process
export const signUpMockData = {
  _id: '605727cd646eb50e668a4e13',
  uId: '92241616324557172',
  username: 'Yorman',
  email: 'yorman@gmail.com',
  avatarColor: '#9c27b0',
  password: 'yordev',
  postCount: 0,
  gender: '',
  quotes: '',
  about: '',
  blocked: [],
  blockedBy: [],
  bgImageVersion: '',
  bgImageId: '',
  work: [],
  school: [],
  location: '',
  createdAt: new Date(),
  followersCount: 0,
  followingCount: 0,
  notifications: { messages: true, reactions: true, comments: true, follows: true },
  profilePicture: 'https://res.cloudinary.com/escalab-academy/image/upload/v1682432288/6447e12032c72ead5abd2333.jpg'
};

// variable para datos para simular datos de cloudinary
export const imageMock = {
  version: '1234737373',
  public_id: '123456'
} as Iimage; //se iguala a la interface para que cumpla con la estructura .. se crea para no usar el type "any"

// destructuracion de variables y valores
export const PASSWORD = 'yordev';
export const USERNAME = 'Yorman';
export const WRONG_USERNAME = 'yo';
export const LONG_USERNAME = 'yormandevelopermaximum';
export const WRONG_PASSWORD = 'yor';
export const LONG_PASSWORD = 'yordevtellitoamaro';
export const JWT = '12djdj34';
export const INVALID_EMAIL = 'yormangmail.com';
// PASSWORD TESTS
export const WRONG_EMAIL = 'test@gmail.com';
export const CORRECT_EMAIL = 'yorman@gmail.com';
