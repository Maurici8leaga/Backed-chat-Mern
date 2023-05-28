import { Request, Response } from 'express';
import * as cloudinaryUploads from '@helpers/cloudinary/cloudinaryUploads';
import { userQueue } from '@services/queues/user.queue';
import { authQueue } from '@services/queues/auth.queue';
import { UserCache } from '@services/redis/user.cache';
import { authMockRequest, authMock, IJWT, imageMock } from '@root/shared/globals/mocks/auth.mock';
import { authMockResponse } from '@root/shared/globals/mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@helpers/errors/customError';
import { authService } from '@services/db/auth.service';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Iimage } from '@helpers/cloudinary/imageResult.interface';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@helpers/cloudinary/cloudinaryUploads');
jest.mock('@services/redis/user.cache');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');

describe('Signup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // Unitary test 1
  it('should throw an error if username is not available', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'yorman@gmail.com',
        password: 'yordev',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  // UNITARY TEST 2
  it('should throw an error if username length is less than minimum length', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ma',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // UNITARY TEST 3
  it('should throw an error if username length is greater than maximum length', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'leodoro2023',
        email: 'yorman@gmail.com',
        password: 'yordev',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // UNITARY TEST 4
  it('should throw an error if email is not valid', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'yordev',
        email: 'asdadasdsasadas',
        password: 'yordev',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  // UNITARY TEST 5
  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'yordev',
        email: '',
        password: 'yordev',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  // UNITARY TEST 6
  it('should throw an error if password is not available', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'yordev',
        email: 'yormandev@gmail.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  // UNITARY TEST 7
  it('should throw an error if password length is less than minimum length', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'yordev',
        email: 'yormandev@gmail.com',
        password: 'yo',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  // UNITARY TEST 8
  it('should throw an error if password length is greater than maximum length', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'yordev',
        email: 'yormandev@gmail.com',
        password: 'yosadadadsadas',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  // Unitary test 8: INTEGRATION TEST 1
  it('should throw unhatorize error is user already exist', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Yorman',
        email: 'yorman@gmail.com',
        password: 'yorpro',
        avatarColor: '#9c27b0',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials for this user');
    });
  });

  // Unitary test 9: INTEGRATION TEST 2
  it('should set session data for valid credentials and send correct json response for user create successfully', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Yorman',
        email: 'yorman@gmail.com',
        password: 'yorpro',
        avatarColor: '#9c27b0',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null!);

    jest
      .spyOn(cloudinaryUploads, 'uploads')
      .mockImplementation(() =>
        Promise.resolve<UploadApiResponse | UploadApiErrorResponse | undefined | Iimage>(imageMock)
      );
    const userSpy = jest.spyOn(UserCache.prototype, 'saveToUserCache');

    jest.spyOn(userQueue, 'addUserJob');
    jest.spyOn(authQueue, 'addAuthUserJob');

    await SignUp.prototype.create(req, res);

    expect(req.session?.jwt as IJWT).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
