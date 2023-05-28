import { Response } from 'express';
import { AuthPayload } from '@auth/interfaces/authPayload.interface';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { Iimage } from '@helpers/cloudinary/imageResult.interface';

export const authMockRequest = (
  sessionData: IJWT,
  body: IAuthMock,
  currentUser?: AuthPayload | null,
  params?: unknown
) => ({
  session: sessionData,
  body,
  currentUser,
  params
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IAuthMock {
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

export const authUserPayload: AuthPayload = {
  userId: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Yorman',
  email: 'yorman@gmail.com',
  avatarColor: '#9c27b0',
  iat: 12345
};

export const authMock = {
  id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Yorman',
  password: 'yordev',
  email: 'yorman@gmail.com',
  avatarColor: '#9c27b0',
  createdAt: new Date(),
  save: () => {}
} as unknown as IAuthDocument;

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

export const imageMock = {
  version: '1234737373',
  public_id: '123456'
} as Iimage;

export const PASSWORD = 'yordev';
export const USERNAME = 'Yorman';
export const WRONG_USERNAME = 'yo';
export const LONG_USERNAME = 'yormandevelopermaximum';
export const WRONG_PASSWORD = 'yor';
export const LONG_PASSWORD = 'yordevtellitoamaro';
export const JWT = '12djdj34';
export const INVALID_EMAIL = 'yormangmail.com';
export const WRONG_EMAIL = 'test@gmail.com';
export const CORRECT_EMAIL = 'yorman@gmail.com';
