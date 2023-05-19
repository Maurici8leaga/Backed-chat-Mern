import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Iimage } from './imageResult.interface';

// se crea una funcion para las configuraciones bases de cloudinary
export function uploads(
  file: string, //este es una propiedad en "base a 64" obligatoria que ira la base 64 + un id propio
  public_id?: string, //propiedad opcional la cual es el id unico con que se identificara el archivo en caso de ser reemplazado o actualizado
  overwrite?: boolean, //este es una propiedaad para en tal caso que se quiera sobre escribir (actualizar) el archivo
  invalidate?: boolean // propiedad opcional para invalidar el recurso anterior en tal caso de haberse actualizado
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined | Iimage> {
  // esta funcion devolvera un tipo el cual es una respuesta o es un mensaje de error, o por defecto undefined
  return new Promise(resolve => {
    cloudinary.v2.uploader.upload(
      // el "v2" es para la version que se esta implementando de cloudinary ya que los siguientes metodos y funciones son de esa version
      // "uploader" es un objeto que trae todos los metodos de subida de archivos de la version 2 de cloudinary
      // "upload" es un metodo de "uploader" es cual como 1er parametro se coloca el file , y el 2do son los opcion para ese file y 3er parametro un callback
      file,
      {
        // se pasan los parametros que tendran cada archivo que se suba al cloud
        public_id, //como los nombres y los valores se llaman igual queda implicito de esta forma
        overwrite,
        invalidate
      },
      // callback para retornar o los resultados o retornar un error
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        // en tal caso de unn error devolvera un mensaje de error en la subida del archivo o retornara undefined
        if (error) {
          resolve(error);
        }
        // de no ocurrir un error se envia el resultado del file
        resolve(result);
      }
    );
  });
}
