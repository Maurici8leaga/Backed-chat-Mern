import { Request, Response } from 'express';
import {
  CORRECT_EMAIL,
  INVALID_EMAIL,
  PASSWORD,
  WRONG_EMAIL,
  authMock,
  authMockRequest,
  authMockResponse
} from '@root/shared/globals/mocks/auth.mock';
import { Password } from '../password';
import { CustomError } from '@helpers/errors/customError';
import { authService } from '@services/db/auth.service';
import { emailQueue } from '@services/queues/email.queue';

jest.useFakeTimers();

jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/email.queue');
jest.mock('@services/db/auth.service');
jest.mock('@services/emails/mail.transport');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // UNITARY TEST 1
  describe('Create', () => {
    it('Should throw an error if email is invalid', async () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request;

      const res: Response = authMockResponse();

      await Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);

        expect(error.serializeErrors().message).toEqual('Email must be valid');
      });
    });

    // INTEGRATION TEST 1
    it('Should throw an error "Invalid Credentials" if email does not exist', async () => {
      const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request;
      const res: Response = authMockResponse();

      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null!);

      await Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credentials');
      });
    });

    // INTEGRATION TEST 2
    it('Should send correct json response for password reset email', async () => {
      const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request;
      const res: Response = authMockResponse();

      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);

      const spyEmailQueue = jest.spyOn(emailQueue, 'addEmailJob');

      await Password.prototype.create(req, res);

      expect(spyEmailQueue).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.'
      });
    });
  });

  describe('Update', () => {
    // UNITARY TEST 1
    it('Should throw an error if password is empty', async () => {
      const req: Request = authMockRequest({}, { password: '' }) as Request;
      const res: Response = authMockResponse();

      await Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    // UNITARY TEST 2
    it('Should throw an error if password and confirmPassword are different', async () => {
      const req: Request = authMockRequest({}, { password: PASSWORD, confirmPassword: `${PASSWORD}2` }) as Request;
      const res: Response = authMockResponse();

      await Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Passwords should match');
      });
    });

    // INTEGRATION TEST 3
    it('Should throw an error if reset token has expired or invalid', async () => {
      const req: Request = authMockRequest({}, { password: PASSWORD, confirmPassword: PASSWORD }, null, {
        token: ''
      }) as Request;
      const res: Response = authMockResponse();

      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(null!);

      await Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token has expired or invalid.');
      });
    });

    // INTEGRATION TEST 4
    it('Should send correct json response with update succesfully password through email', async () => {
      const req: Request = authMockRequest({}, { password: PASSWORD, confirmPassword: PASSWORD }, null, {
        token: '12sde3'
      }) as Request;
      const res: Response = authMockResponse();

      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(authMock);

      const spyEmailQueue = jest.spyOn(emailQueue, 'addEmailJob');

      await Password.prototype.update(req, res);

      expect(spyEmailQueue).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated. '
      });
    });
  });
});
