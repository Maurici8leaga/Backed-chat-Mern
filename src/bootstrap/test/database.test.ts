import mongoose, { connect } from 'mongoose';
import { config } from '@configs/configEnv';
import { FAILED_PATH_DB } from '@root/shared/globals/mocks/database.mock';
import { redisConnection } from '@services/redis/redis.connection';

jest.useFakeTimers(); // es un observador que controla procesos y tiempos de ejecucion

jest.mock('@configs/configEnv'); //aqui simulamos todo el modulo de configs para al simular el proceso mas real posible
jest.mock('@services/redis/redis.connection'); //"mock" simula un modulo que se encuentren en cierto directorio con sus caracteristicas en este caso el file que se  le  pasa en la ruta
jest.mock('@configs/configLogs');

// "describe" es el titulo del test, de lo que vas a testear, el 1er parametro sera el nombre, el 2do es va ser un callback
describe('Mongo and Redis database connections', () => {
  beforeEach((done: jest.DoneCallback) => {
    // el beforeEach es para  ejecutar funciones antes de arrancar cada test, en este caso para limpiar los test anteriores
    jest.resetAllMocks();
    // resettAllMocks , borra otros test que se hallan ejecutado antes, para que no se ejecuten otros test y no cree otros mocks aparte del que estas ejecutando
    // SIEMPRE SE DEBE LIMPIAR LOS MOCKS
    done();
  });

  afterEach((done: jest.DoneCallback) => {
    // el "afterEach" es para ejecuciones que se realizan una vez que se ha resuelto el test
    jest.clearAllMocks(); //despues de cada ejecucion de test este ayuda a limpiar los datos ocupados de otros mocks
    jest.clearAllTimers(); //Limpia los procesos de escucha de los observadores de ejecucion
    mongoose.connection.close(); //para cerrar las conecciones de la DB
    done(); // "done" se usa para finalizar procesos asincronos que pudiesen haber quedado aun cargados
  });

  // INTEGRATION TEST 1
  it('Should throw an error if the database does not connect', () => {
    // el "it" describes que es lo que se va a testear y como se va a hacer, su 1er  parametro es el nombre del test, el 2do
    // sera un callback el cual sera el test

    // GIVEN STEP
    mongoose.connect = jest.fn(() => {
      // ya que sabemos que el connect de mongoose va a dar un error con "fn" generamos un mock de la funcion que retorna un
      // mensaje para cuando el server no se puede conectar
      throw new Error('Error connecting to database');
    });

    // WHEN STEP
    const expectedUrl = FAILED_PATH_DB; //se simula un direccion falsa

    // THEN STEP: ASSERTION
    expect(() => {
      //"expect" Es donde se define lo que esperas recibir del test
      mongoose.connect(expectedUrl);
    }).toThrowError(/Error connecting to database/);
    // "toThrowError" Este especifica que el caso retornando en el que se esta implementando es una excepcion de error que devuelve el mensaje pasado.
  });

  // INTEGRATION TEST 2
  it('Should must be connect to database mongo connection and call redis connection', done => {
    //se pasa "done" como parametro para finalizar procesos asincronos que pudiesen haber quedado aun cargados

    // GIVEN STEP
    const spy = jest.spyOn(mongoose, 'connect');
    // spyon Permite realizar pruebas de integracion mediante observadores de procesos, esto se hace mediante inspectores espias, que luego pueden ser escuchados por otros espias.
    // spyon parametros, 1ro es el modulo donde se encuentra el proceso que queremos realizar , 2do. es el metodo que queremos que espie se pasa entre "" como key

    const expectedUrl = `${config.DATABASE_URL}`; //la ruta verdadera de la DB

    // WHEN STEP
    mongoose.connect(expectedUrl);
    jest.spyOn(redisConnection, 'connect');

    // THEN STEP: ASSERTION
    expect(spy).toHaveBeenCalledWith(expectedUrl);
    //"toHaveBeenCalledWith" verifica que la ejecucion del mock se resuelva con el valor pasado para realizar la assertion
    expect(spy).toHaveBeenCalledTimes(1);
    //este delimita y verifica la cantidad de ejecuciones para resolver un test, en este caso 1 sola vez
    done();
    //done para terminar los procesos asincronos de este test
  });
});
