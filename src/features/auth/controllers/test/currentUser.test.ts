import { Request, Response } from 'express';
import {
  authMockRequest,
  authMockResponse,
  authUserPayload,
  JWT,
  PASSWORD,
  USERNAME
} from '@root/shared/globals/mocks/auth.mock';
import { UserCache } from '@services/redis/user.cache';
import { existingUser } from '@root/shared/globals/mocks/user.mock';
import { CurrentUser } from '../currentUser';
import { IUserDocument } from '@user/interfaces/userDocument.interface';
import { userService } from '@services/db/user.service';

jest.mock('@services/redis/user.cache');
jest.mock('@services/db/user.service');

jest.useFakeTimers();

describe('CurrentUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Session Tokens CurrentUser', () => {
    // INTEGRATION TEST 1
    it('should send correct json response with token and user null and isUser false', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;
      const res: Response = authMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue({} as IUserDocument);

      await CurrentUser.prototype.read(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: null,
        isUser: false,
        user: null
      });
    });

    // INTEGRATION TEST 2
    it('should set session token and send correct json response from redis or mongo', async () => {
      const req: Request = authMockRequest(
        { jwt: JWT },
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as Request;
      const res: Response = authMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser) ||
        jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser);

      await CurrentUser.prototype.read(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true,
        user: existingUser
      });
    });
  });
});
