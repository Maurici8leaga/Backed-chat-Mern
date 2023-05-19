// estas es una abstraccion de una interfaz para ser implementada en otros files
import { ISocialLinks } from './socialLinks.interface';

// estas interfaces son como una puerta de acceso o de bloqueo, algo asi como una capa intermedia de cumplimiento de datos

// se crea una interfaz para definir la estructura de un models (SOLID Interface Segregation)s
export interface IUserJobInfo {
  key?: string;
  value?: string | ISocialLinks;
}
