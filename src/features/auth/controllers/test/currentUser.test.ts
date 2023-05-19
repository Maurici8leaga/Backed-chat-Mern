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

jest.mock('@services/redis/user.cache'); //es recomendable usarlo en pruebas de integreacion OJO
//"mock" simula un modulo que se encuentren en cierto directorio con sus caracteristicas en este caso el file que se  le  pasa en la ruta
jest.mock('@services/db/user.service');

jest.useFakeTimers(); // es un observador que controla procesos y tiempos de ejecucion

// "describe" es el titulo del test, de lo que vas a testear, el 1er parametro sera el nombre, el 2do es va ser un callback
describe('CurrentUser', () => {
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

  // DATO OJO se puede tener varios describe que se quieran
  describe('Session Tokens CurrentUser', () => {
    // INTEGRATION TEST 1
    it('should send correct json response with token and user null and isUser false', async () => {
      // el "it" describes que es lo que se va a testear y como se va a hacer, su 1er  parametro es el nombre del test, el 2do
      // sera un callback el cual sera el test

      // GIVEN STEP
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;
      // en este caso del request es necesario que se coloque el "authUserPayload" ya que el metodo read de "CurrentUser" va a buscar un "userId" y dentro de el se encuentra uno
      //este "authMockRequest" es una abstraccion de codigo que viene de auth.mocks donde en el
      // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

      const res: Response = authMockResponse(); //este "authMockResponse" es una abstraccion de codigo que viene de auth.mocks donde en el
      // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

      // WHEN STEP
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue({} as IUserDocument);
      // spyon Permite realizar pruebas de integracion mediante observadores de procesos, esto se hace mediante inspectores espias, que luego pueden ser escuchados por otros espias.
      // spyon parametros, 1ro es el modulo donde se encuentra el proceso que queremos realizar , 2do. es el metodo que queremos que espie se pasa entre "" como key
      // "mockResolvedValue"  aqui el authmock va a ser la data de referencia osea simulando la data de una DB para asi comparar si ese user ya existe o no, en este caso se le pasa vacio

      await CurrentUser.prototype.read(req, res);

      // THEN STEP: ASSERTION
      expect(res.status).toHaveBeenCalledWith(200);
      //"toHaveBeenCalledWith" verifica que la ejecucion del mock se resuelva con el valor pasado para realizar la assertion
      expect(res.json).toHaveBeenCalledWith({
        token: null,
        isUser: false,
        user: null
      });
    });

    // INTEGRATION TEST 2
    it('should set session token and send correct json response from redis or mongo', async () => {
      // GIVEN STEP
      const req: Request = authMockRequest(
        { jwt: JWT }, //en este caso si le pasamos token
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as Request;
      const res: Response = authMockResponse();

      // WHEN STEP
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser) ||
        // "mockResolvedValue"  aqui el authmock va a ser la data de referencia osea simulando la data de una DB para asi comparar si ese user ya existe o no,
        // en este caso se le pasa "existingUser" que es la data simulada de la DB. entonces si de la cache no se encuentra y retorna false
        // entonces obteniendo el user por "getUserById" debe dar true
        jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser);

      await CurrentUser.prototype.read(req, res);

      // THEN STEP: ASSERTION
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true, //como si se encontro user en la DB va este como true
        user: existingUser
      });
    });
  });
});
