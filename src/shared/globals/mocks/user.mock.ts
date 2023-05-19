import { IUserDocument } from '@user/interfaces/userDocument.interface';

export const existingUser = {
  notifications: {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '605727cd646eb50e668a4e13',
  uId: '92241616324557172',
  username: 'Yorman',
  email: 'yorman@gmail.com',
  avatarColor: '#9c27b0',
  work: 'Google Inc.',
  school: 'University of Life',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;
