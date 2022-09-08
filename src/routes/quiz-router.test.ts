import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { app } from '../index';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { newUser1, newUser2 } from '../testParams/test-route-values';
import { IUser } from '../types';
import { JwtPassService } from '../utils/jwt-pass-service';
import { expiredAccess } from '../variables';

const agent = supertest(app);

describe('test quiz-router "/pair-game-quiz"', function () {
  const usersRepositoryDB = new UsersRepositoryDB();

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  describe('test  post  "/pairs/connection" endpoint ', () => {
    const jwtPassService = new JwtPassService();

    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
    });

    it('should return new game data than create pair and start', async () => {
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;

      const accessToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredAccess);

      const bearer = `Bearer ${accessToken}`;
      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', bearer)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              gameStatus: 'PendingSecondPlayer',
              questions: expect.any(Array),
              firstPlayerId: expect.any(String),
              secondPlayerId: null,
              pairCreatedDate: null,
              startGameDate: expect.any(String),
              finishGameDate: null,
              winnerUserId: null,
              firstPlayerScore: null,
              secondPlayerScore: null,
              _id: expect.any(String),
            }),
          );
        });
      await usersRepositoryDB.createUser(
        newUser2.login,
        newUser2.password,
        newUser2.email,
        newUser2.userIp,
        newUser2.confirmationCode,
      );
      const newUser_2 = (await usersRepositoryDB.getUserByLogin(newUser2.login)) as IUser;

      const accessToken_2 = jwtPassService.createJwt(new ObjectId(newUser_2._id), expiredAccess);

      const bearer_2 = `Bearer ${accessToken_2}`;
      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', bearer_2)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              gameStatus: 'Active',
              questions: expect.any(Array),
              firstPlayerId: expect.any(String),
              secondPlayerId: expect.any(String),
              pairCreatedDate: expect.any(String),
              startGameDate: expect.any(String),
              finishGameDate: null,
              winnerUserId: null,
              firstPlayerScore: null,
              secondPlayerScore: null,
              _id: expect.any(String),
            }),
          );
        });
    });
  });
});
