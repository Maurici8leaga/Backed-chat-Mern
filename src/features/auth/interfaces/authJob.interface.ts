// TODO LAS INTERFACES QUE TERMINEN CON JOB SON PARA LOS WORKERSs
import { IAuthDocument } from './authDocument.interface';
import { IUserDocument } from '@user/interfaces/userDocument.interface';

// esta es una interfaz para los workers (SOLID Interface Segregation)s
export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
