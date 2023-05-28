import HTTP_STATUS from 'http-status-codes';
import { CustomError } from './customError';

export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}
