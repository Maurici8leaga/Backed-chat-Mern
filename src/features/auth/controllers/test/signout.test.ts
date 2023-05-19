import { Request, Response } from 'express';
import { authMockRequest, authMockResponse, PASSWORD, USERNAME } from '@root/shared/globals/mocks/auth.mock';
import { SignOut } from '../signout';

jest.useFakeTimers(); // es un observador que controla procesos y tiempos de ejecucion

// "describe" es el titulo del test, de lo que vas a testear, el 1er parametro sera el nombre, el 2do es va ser un callback
describe('Signout', () => {
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

  // UNITARY TEST 1
  it('Should set session to null', async () => {
    // el "it" describes que es lo que se va a testear y como se va a hacer, su 1er  parametro es el nombre del test, el 2do
    // sera un callback el cual sera el test

    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    //este "authMockRequest" es una abstraccion de codigo que viene de auth.mocks donde en el
    // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño
    //el token "{}" es un json por ende es un objeto vacio que se coloca

    const res: Response = authMockResponse(); //este "authMockResponse" es una abstraccion de codigo que viene de auth.mocks donde en el
    // se especificaron los parametros con sus valores, de esta forma se implementa el patron de diseño

    // WHEN STEP
    await SignOut.prototype.update(req, res);
    // en el SignOut se debe prototypar igual para poder ser implementado

    // THEN STEP: ASSERT
    expect(req.session).toBeNull(); //"toBeNull" Esta espera que el valor con el que se esta comparando sea null, en este caso el token
  });

  // UNITARY TEST 2
  it('Should send correct json response for logout succesful', async () => {
    // GIVEN STEP
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    // WHEN STEP
    await SignOut.prototype.update(req, res);

    // THEN STEP: ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    //"toHaveBeenCalledWith" verifica que la ejecucion del mock se resuelva con el valor pasado para realizar la assertion
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout successful',
      user: {},
      token: ''
    });
  });
});
