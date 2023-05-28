import { INotificationSettings } from './notificationSettings.interface';
import { IUserDocument } from './userDocument.interface';

export interface IUserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value?: string | INotificationSettings | IUserDocument;
}
