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

jest.useFakeTimers(); // es un observador que controla procesos y tiempos de ejecucion

jest.mock('@services/queues/base.queue'); //"mock" simula un modulo que se encuentren en cierto directorio con sus caracteristicas en este caso el file que se  le  pasa en la ruta
jest.mock('@services/queues/email.queue');
jest.mock('@services/db/auth.service');
jest.mock('@services/emails/mail.transport');

// "describe" es el titulo del test, de lo que vas a testear, el 1er parametro sera el nombre, el 2do es va ser un callback
describe('Password', () => {
  beforeEach(() => {
    // el beforeEach es para  ejecutar funciones antes de arrancar cada test, en este caso para limpiar los test anteriores
    jest.restoreAllMocks();
    // restoreAllMocks , borra otros test que se hallan ejecutado antes, para que no se ejecuten otros test y no cree otros mocks aparte del que estas ejecutando
    // SIEMPRE SE DEBE LIMPIAR LOS MOCKS
  });

  afterEach(() => {
    // el "afterEach" es para ejecuciones que se realizan una vez que se ha resuelto el test
    jest.clearAllMocks(); //despues de cada ejecucion de test este ayuda a limpiar los datos ocupados de otros mocks
    jest.clearAllTimers(); //Limpia los procesos de escucha de los observadores de ejecucion
  });

  // UNITARY TEST 1
  //cuando existen 2 o mas "describe" se ejecutan paso a paso primero se ejecuta uno y luego que termine ese se ejecuta el otro
  describe('Create', () => {
    it('Should throw an error if email is invalid', async () => {
      // el "it" describes que es lo que se va a testear y como se va a hacer, su 1er  parametro es el nombre del test, el 2do
      // sera un callback el cual sera el test

      // GIVEN STEP
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request;
      //este "authMockRequest" es una abstraccion de codigo que viene de auth.mocks donde en el
      // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

      const res: Response = authMockResponse(); //este "authMockResponse" es una abstraccion de codigo que viene de auth.mocks donde en el
      // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

      // WHEN STEP
      await Password.prototype.create(req, res).catch((error: CustomError) => {
        // el create es un promise por eso se usa "catch" ya que sabemos que retornara un error
        // en el "Password" se debe prototypar igual para poder ser implementado

        // THEN STEP
        expect(error.statusCode).toEqual(400); //se envia el status esperado
        // el "toEqual" Verificar que el valor del test es igual al esperado

        expect(error.serializeErrors().message).toEqual('Email must be valid'); //se envia el mensaje esperado
      });
    });

    // INTEGRATION TEST 1
    it('Should throw an error "Invalid Credentials" if email does not exist', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request;
      const res: Response = authMockResponse();

      // WHEN STEP
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null!); //pasamos como null para simular que no se encontro en la DB
      // spyon Permite realizar pruebas de integracion mediante observadores de procesos, esto se hace mediante inspectores espias, que luego pueden ser escuchados por otros espias.
      // spyon parametros, 1ro es el modulo donde se encuentra el proceso que queremos realizar , 2do. es el metodo que queremos que espie se pasa entre "" como key

      await Password.prototype.create(req, res).catch((error: CustomError) => {
        // en el Password se debe prototypar igual para poder ser implementado

        // THEN STEP: ASSERTIONS
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credentials');
      });
    });

    // INTEGRATION TEST 2
    it('Should send correct json response for password reset email', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request;
      const res: Response = authMockResponse();

      // WHEN STEP
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      // MockResolvedValue: Me permite pasar valores disponibles con los cuales puedo usar para simular procesos integrados

      // se agrega el queue ya que es parte del proceso
      const spyEmailQueue = jest.spyOn(emailQueue, 'addEmailJob');

      await Password.prototype.create(req, res);

      // THEN STEP: ASSERTIONS
      expect(spyEmailQueue).toHaveBeenCalled(); // se pasa este para seguraar que ese proceso del queue se cumpla bien ya que sin el proceso fallaria
      // esta cumple la assertion si la llamada a una funcion se realiza correctamente sin la necesidad de recibir parametros
      expect(res.status).toHaveBeenCalledWith(200); //  si se aplica arriba "toHaveBeenCalled" debe ser aplicado el resto hacia abajo
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.'
      });
    });
  });

  // DATO OJO se puede tener varios describe que se quieran
  describe('Update', () => {
    // UNITARY TEST 1
    it('Should throw an error if password is empty', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest({}, { password: '' }) as Request;
      const res: Response = authMockResponse();

      // WHEN STEP
      await Password.prototype.update(req, res).catch((error: CustomError) => {
        // THEN STEP: ASSERTIONS
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field'); //OJO se pone el mensaje del validador de joi no del controlador
      });
    });

    // UNITARY TEST 2
    it('Should throw an error if password and confirmPassword are different', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest({}, { password: PASSWORD, confirmPassword: `${PASSWORD}2` }) as Request; // se agrega el 2 para que o coincida
      const res: Response = authMockResponse();

      // WHEN STEP
      await Password.prototype.update(req, res).catch((error: CustomError) => {
        // THEN STEP: ASSERTIONS
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Passwords should match'); //OJO se pone el mensaje del validador de joi no del controlador
      });
    });

    // INTEGRATION TEST 3
    it('Should throw an error if reset token has expired or invalid', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest({}, { password: PASSWORD, confirmPassword: PASSWORD }, null, {
        //se pasa null el currentUser porque no esta siendo logeado aun
        token: '' // se prueba de que el token del reset passsword del request no exista por eso se deja vacio
      }) as Request;
      const res: Response = authMockResponse();

      // WHEN STEP
      // para poder hacer un reset del password se tiene que buscar en la DB primero, si no hay data entonces no hay nada por act
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(null!); //se pasa null para simular que no se encuentra en la DB

      await Password.prototype.update(req, res).catch((error: CustomError) => {
        // THEN STEP: ASSERTIONS
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token has expired or invalid.');
      });
    });

    // INTEGRATION TEST 4
    it('Should send correct json response with update succesfully password through email', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest({}, { password: PASSWORD, confirmPassword: PASSWORD }, null, {
        //se pasa null el currentUser porque no esta siendo logeado aun

        token: '12sde3' //este es una simulacion de un token del reset password
      }) as Request;
      const res: Response = authMockResponse();

      // WHEN STEP
      // para poder hacer un reset del password se tiene que buscar en la DB primero, si no hay data entonces no hay nada por act
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(authMock); // 'authMock' es la data encontrada en la DB

      // como este proceso si queremos que de una respuesta positiva, simulamos los queues con el proceso tambien
      const spyEmailQueue = jest.spyOn(emailQueue, 'addEmailJob');

      await Password.prototype.update(req, res);

      // THEN STEP: ASSERTIONS
      expect(spyEmailQueue).toHaveBeenCalled(); // se pasa este para seguraar que ese proceso del queue se cumpla bien ya que sin el proceso fallaria
      // esta cumple la assertion si la llamada a una funcion se realiza correctamente sin la necesidad de recibir parametros
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated. '
      });
    });
  });
});
