// estas es una abstraccion de una interfaz para ser implementada en otros files
import { INotificationSettings } from './notificationSettings.interface';
import { IUserDocument } from './userDocument.interface';

// estas interfaces son como una puerta de acceso o de bloqueo, algo asi como una capa intermedia de cumplimiento de datos

// se crea una interfaz para definir la estructura de un models (SOLID Interface Segregation)s
export interface IUserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value?: string | INotificationSettings | IUserDocument;
}
