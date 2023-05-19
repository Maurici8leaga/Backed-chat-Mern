import { ObjectId } from 'mongodb';

// (SOLID Interface Segregation)
export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  email: string;
  username: string;
  password: string;
  avatarColor: string;
}
