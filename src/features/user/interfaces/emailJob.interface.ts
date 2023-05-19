// estas es una abstraccion de una interfaz para ser implementada en otros files
// estas interfaces son como una puerta de acceso o de bloqueo, algo asi como una capa intermedia de cumplimiento de datos

// se crea una interfaz para definir la estructura de un models
export interface IEmailJob {
  receiverEmail: string;
  template: string;
  subject: string;
}
