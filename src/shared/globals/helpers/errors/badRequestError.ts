import HTTP_STATUS from 'http-status-codes';
import { CustomError } from './customError';

export class BadRequestError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}
