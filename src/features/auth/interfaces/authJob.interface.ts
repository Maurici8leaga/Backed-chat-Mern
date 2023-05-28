import { IAuthDocument } from './authDocument.interface';
import { IUserDocument } from '@user/interfaces/userDocument.interface';

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
