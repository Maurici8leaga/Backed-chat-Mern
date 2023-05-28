import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@services/db/auth.service';
import { UserCache } from '@services/redis/user.cache';
import { BadRequestError } from '@helpers/errors/badRequestError';
import { Generators } from '@helpers/generators/generators';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@helpers/cloudinary/cloudinaryUploads';
import { IUserDocument } from '@user/interfaces/userDocument.interface';
import { omit } from 'lodash';
import { userQueue } from '@services/queues/user.queue';
import { authQueue } from '@services/queues/auth.queue';
import HTTP_STATUS from 'http-status-codes';
import { SignUpUtility } from './utilities/signup.utility';
import { config } from '@configs/configEnv';

const userCache: UserCache = new UserCache();

export class SignUp extends SignUpUtility {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials for this user');
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();

    const uId = `${Generators.generateRandomIntegers(12)}`;

    const passwordHash = await Generators.hash(password);

    const authData: IAuthDocument = SignUp.prototype.signUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      password: passwordHash,
      avatarColor
    });

    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`)) as UploadApiResponse;

    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error ocurred. Try again.');
    }

    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `${config.CLOUD_DOMAIN}/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveToUserCache(`${userObjectId}`, uId, userDataForCache);
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);

    authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForCache });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJwt };

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
  }
}
