import { Request, Response } from 'express';
import {
  IJWT,
  LONG_PASSWORD,
  LONG_USERNAME,
  PASSWORD,
  USERNAME,
  WRONG_PASSWORD,
  WRONG_USERNAME,
  authMock,
  authMockRequest,
  authMockResponse
} from '@root/shared/globals/mocks/auth.mock';
import { SignIn } from '../signin';
import { CustomError } from '@helpers/errors/customError';
import { authService } from '@services/db/auth.service';
import { Generators } from '@helpers/generators/generators';

jest.useFakeTimers(); // "useFakeTimers" es un observador que controla procesos y tiempos de ejecucion

// "describe" es el titulo del test, de lo que vas a testear, el 1er parametro sera el nombre, el 2do es va ser un callback
describe('SignIn', () => {
  beforeEach(() => {
    // el beforeEach es para  ejecutar funciones antes de arrancar cada test
    jest.restoreAllMocks();
    // "restoreAllMocks" Esta permite dejar previamente cargada la definicion de los mocks de cara a los test's
  });

  afterEach(() => {
    jest.clearAllMocks(); //despues de cada ejecucion de test este ayuda a limpiar los datos ocupados de otros mocks
    jest.clearAllTimers(); //Limpia los procesos de escucha de los observadores de ejecucion
  });
  // el "afterEach" es para ejecuciones que se realizan una vez que se ha resuelto el test

  // UNITARY TEST 1
  it('should throw an error if username is not available', async () => {
    // el "it" describes que es lo que se va a testear y como se va a hacer, su 1er  parametro es el nombre del test, el 2do
    // sera un callback el cual sera el test

    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    //este "authMockRequest" es una abstraccion de codigo que viene de auth.mocks donde en el
    // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño
    //el token  es un json por ende es un objeto vacio que se coloca "{}"

    const res: Response = authMockResponse();
    //este "authMockResponse" es una abstraccion de codigo que viene de auth.mocks donde en el
    // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

    // WHEN STEP
    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // el "read" es un promise por eso se usa "catch" ya que sabemos que retornara un error
      // en el signin se debe prototypar igual para poder ser implementado

      // THEN STEP

      // ya que en el signin se espera enviar un status y un mensaje (json) entonces se debe..
      expect(error.statusCode).toEqual(400); //se envia el status esperado
      // el "toEqual" Verificar que el valor del test es igual al esperado
      expect(error.serializeErrors().message).toEqual('Username is a required field'); //se envia el mensaje esperado
    });
  });

  // UNITARY TEST 2
  it('should throw an error if password is not available', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // THEN STEP
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  // UNITARY TEST 3
  it('should throw an error if username is less than minimum length', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // THEN STEP
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // UNITARY TEST 4
  it('should throw an error if username is greater than maximum length', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // THEN STEP
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // UNITARY TEST 5
  it('should throw an error if password is less than minimum length', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // THEN STEP
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  // Unitary test 6
  it('should throw an error if password is greater than maximum length', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // THEN STEP
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  // Unitary test 7: INTEGRATION TEST 1
  it('should throw "Invalid credentials" if username does not exist', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null!);
    // spyon Permite realizar pruebas de integracion mediante observadores de procesos, esto se hace mediante inspectores espias, que luego pueden ser escuchados por otros espias.
    // spyon parametros, 1ro es el modulo donde se encuentra el proceso que queremos realizar , 2do. es el metodo que queremos que espie se pasa entre "" como key
    // "mockResolvedValueOnce" Resuelve el mock mediante la resolucion de un solo valor, en este caso es null

    await SignIn.prototype.read(req, res).catch((error: CustomError) => {
      // THEN STEP: ASSERT
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(
        //"toHaveBeenCalledWith" verifica que la ejecucion del mock se resuelva con el valor pasado para realizar la assertion
        Generators.firstLetterUppercase(req.body.username)
      );
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  // Unitary test 8: INTEGRATION TEST 2
  it('should set session data for valid credentials and send correct json response for login successfully', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    authMock.comparePassword = () => Promise.resolve(true); // se le dice que true para simular que el password es correcto
    // el "comparePassword" viene de la interface IAuthDocument que tiene un metodo para comparar el password pasado
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(authMock);
    // "authMock" es una variable que contiene data fictisia para simular y hacer lso test

    await SignIn.prototype.read(req, res);

    // THEN STEP: ASSERT
    expect(req.session?.jwt as IJWT).toBeDefined(); //"toBeDefined" Asegura que la variable en la que es implementada siempre venga con su valor y no con undefined
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: authMock,
      token: req.session?.jwt
    });
  });
});
