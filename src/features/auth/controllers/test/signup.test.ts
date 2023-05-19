import { Request, Response } from 'express';
import * as cloudinaryUploads from '@helpers/cloudinary/cloudinaryUploads';
// se usa este * para cambiarle el nombre a la funcion del file que estamos importando
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

jest.useFakeTimers(); // es un observador que controla procesos y tiempos de ejecucion
jest.mock('@services/queues/base.queue'); //simula un modulo que se encuentren en cierto directorio con sus caracteristicas en este caso el file que se  le  pasa en la ruta
jest.mock('@helpers/cloudinary/cloudinaryUploads');
jest.mock('@services/redis/user.cache');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');

// "describe" es el titulo del test, de lo que vas a testear, el 1er parametro sera el nombre, el 2do es va ser un callback
describe('Signup', () => {
  beforeEach(() => {
    // el beforeEach es para  ejecutar funciones antes de arrancar cada test, en este caso para limpiar los test anteriores
    jest.resetAllMocks();
    // resettAllMocks , borra otros test que se hallan ejecutado antes, para que no se ejecuten otros test y no cree otros mocks aparte del que estas ejecutando
    // SIEMPRE SE DEBE LIMPIAR LOS MOCKS
  });

  afterEach(() => {
    // el "afterEach" es para ejecuciones que se realizan una vez que se ha resuelto el test
    jest.clearAllMocks(); //despues de cada ejecucion de test este ayuda a limpiar los datos ocupados de otros mocks
    jest.clearAllTimers(); //Limpia los procesos de escucha de los observadores de ejecucion
  });

  // Unitary test 1
  it('should throw an error if username is not available', async () => {
    // el "it" describes que es lo que se va a testear y como se va a hacer, su 1er  parametro es el nombre del test, el 2do
    // sera un callback el cual sera el test

    // GIVEN STEP
    const req: Request = authMockRequest(
      //este "authMockRequest" es una abstraccion de codigo que viene de auth.mocks donde en el
      // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

      {}, //el token es un json por ende es un objeto vacio que se coloca
      {
        username: '',
        email: 'yorman@gmail.com',
        password: 'yordev',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse(); //este "authMockResponse" es una abstraccion de codigo que viene de auth.mocks donde en el
    // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // el create es un promise por eso se usa "catch" ya que sabemos que retornara un error
      // en el signup se debe prototypar igual para poder ser implementado

      // THEN STEP: ASSERT

      // ya que en el signup se espera enviar un status y un mensaje (json) entonces se debe..

      expect(error.statusCode).toEqual(400); //se envia el status esperado
      // el "toEqual" Verificar que el valor del test es igual al esperado
      expect(error.serializeErrors().message).toEqual('Username is a required field'); //se envia el mensaje esperado
    });
  });

  // UNITARY TEST 2
  it('should throw an error if username length is less than minimum length', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // UNITARY TEST 3
  it('should throw an error if username length is greater than maximum length', async () => {
    //  los titulos de los test deben ser lo mas representativa posible

    // GIVEN STEP
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

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // UNITARY TEST 4
  it('should throw an error if email is not valid', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  // UNITARY TEST 5
  it('should throw an error if email is not available', () => {
    // GIVEN STEP
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

    // WHEN STEP
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  // UNITARY TEST 6
  it('should throw an error if password is not available', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  // UNITARY TEST 7
  it('should throw an error if password length is less than minimum length', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  // UNITARY TEST 8
  it('should throw an error if password length is greater than maximum length', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  // Unitary test 8: INTEGRATION TEST 1
  it('should throw unhatorize error is user already exist', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    // spyon Permite realizar pruebas de integracion mediante observadores de procesos, esto se hace mediante inspectores espias, que luego pueden ser escuchados por otros espias.
    // spyon parametros, 1ro es el modulo donde se encuentra el proceso que queremos realizar , 2do. es el metodo que queremos que espie se pasa entre "" como key
    // mockResolvedValue (authmock) aqui el authmock va a ser la data de referencia osea simulando la data de una DB para asi comparar si ese user ya existe o no

    await SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials for this user');
    });
  });

  // Unitary test 9: INTEGRATION TEST 2
  it('should set session data for valid credentials and send correct json response for user create successfully', async () => {
    // GIVEN STEP
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

    // WHEN STEP
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null!);

    // se agrega los spys para cloudinary
    jest
      .spyOn(cloudinaryUploads, 'uploads')
      // spyon parametrros, 1ro es el modulo donde se encuentra el proceso que queremos realizar , 2do. es el metodo que queremos que espie se pasa entre "" como key
      .mockImplementation(
        () =>
          // acepta una function que es implementada en el mock.. SOLO SE PASA UNA FUNCION A DIFERENCIA DE Los OTROs
          Promise.resolve<UploadApiResponse | UploadApiErrorResponse | undefined | Iimage>(imageMock) //"imageMock" es los datos  inventados de cloudinary para hacer del test
      );
    const userSpy = jest.spyOn(UserCache.prototype, 'saveToUserCache');

    // se agrega los spys para las colas
    jest.spyOn(userQueue, 'addUserJob');
    //el name y la data de los queues viene de la cache por eso no es necesario pasarle mockRResolvedValue
    jest.spyOn(authQueue, 'addAuthUserJob');

    await SignUp.prototype.create(req, res); //para  crear el usuario

    // THEN STEP
    expect(req.session?.jwt as IJWT).toBeDefined(); //"toBeDefined" es para asegurar que el valor de ua variable no sea undefined
    expect(res.status).toHaveBeenCalledWith(201); // "toHaveBeenCalledWidth" es para asegurarse que los parametros de una funcion venga con todos sus valores
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2], //"calls"  Permite apuntar a argumentos de un mock generado
      token: req.session?.jwt
    });
  });
});
