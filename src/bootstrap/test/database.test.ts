import mongoose, { connect } from 'mongoose';
import { config } from '@configs/configEnv';
import { FAILED_PATH_DB } from '@root/shared/globals/mocks/database.mock';
import { redisConnection } from '@services/redis/redis.connection';

jest.useFakeTimers();

jest.mock('@configs/configEnv');
jest.mock('@services/redis/redis.connection');
jest.mock('@configs/configLogs');

describe('Mongo and Redis database connections', () => {
  beforeEach((done: jest.DoneCallback) => {
    jest.resetAllMocks();
    done();
  });

  afterEach((done: jest.DoneCallback) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mongoose.connection.close();
    done();
  });

  // INTEGRATION TEST 1
  it('Should throw an error if the database does not connect', () => {
    mongoose.connect = jest.fn(() => {
      throw new Error('Error connecting to database');
    });

    const expectedUrl = FAILED_PATH_DB;

    expect(() => {
      mongoose.connect(expectedUrl);
    }).toThrowError(/Error connecting to database/);
  });

  // INTEGRATION TEST 2
  it('Should must be connect to database mongo connection and call redis connection', done => {
    const spy = jest.spyOn(mongoose, 'connect');

    const expectedUrl = `${config.DATABASE_URL}`;

    mongoose.connect(expectedUrl);
    jest.spyOn(redisConnection, 'connect');

    expect(spy).toHaveBeenCalledWith(expectedUrl);
    expect(spy).toHaveBeenCalledTimes(1);
    done();
  });
});
