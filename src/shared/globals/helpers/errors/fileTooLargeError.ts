import HTTP_STATUS from 'http-status-codes';
import { CustomError } from './customError';

export class FileTooLargeError extends CustomError {
  statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}
