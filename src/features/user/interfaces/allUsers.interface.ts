import { IUserDocument } from './userDocument.interface';

export interface IAllUsers {
  users: IUserDocument[];
  totalUsers: number;
}
