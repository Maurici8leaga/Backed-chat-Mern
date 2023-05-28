import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Iimage } from './imageResult.interface';

export function uploads(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined | Iimage> {
  return new Promise(resolve => {
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          resolve(error);
        }
        resolve(result);
      }
    );
  });
}
