import { injectable, inject } from 'inversify';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Games, IGameSchema } from '../models/gamesModel';
import { Questions } from '../models/questionsModel';
import { quizQuestions } from '../variables';
import { PlayersRepositoryDB } from './players-repository-db';

@injectable()
export class GamesRepositoryDB {
  constructor(@inject(PlayersRepositoryDB) protected playersRepositoryDB: PlayersRepositoryDB) {}

  // async getAllUserGame(
  //   pageSize: number,
  //   pageNumber: number,
  //   userId: string,
  // ): IPaginationResponse<IMyCurrentGameResponse[]> {
  //   let totalCount: number | undefined = 0;
  //   let totalPages = 0;
  //   totalCount = await Players.countDocuments({ $or: [{ userId: userId }, { secondPlayerId: userId }] });
  //   const allPlayers = await Players.find({ $or: [{ userId: userId }, { secondPlayerId: userId }] }).populate([
  //     // { path: 'userId', select: '_id name', options: { lean: true } },
  //     // { path: 'secondPlayerId', select: '_id name', options: { lean: true } },
  //     { path: 'gameId', select: '_id name', options: { lean: true } },
  //     { path: 'answersId', select: '_id name', options: { lean: true } },
  //   ]);
  //   {
  //     id: string;
  //     firstPlayer: IPlayer;
  //     secondPlayer: IPlayer | null;
  //     questions: IQuestion[];
  //     status: IGameStatus;
  //     pairCreatedDate: Date;
  //     startGameDate: Date;
  //     finishGameDate: Date;
  //   }
  //   const allBloggers = await (
  //     await Bloggers.find({ name: namePart })
  //       .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
  //       .limit(pageSize)
  //       .lean()
  //   ).map((i) => {
  //     return { id: i._id, name: i.name, youtubeUrl: i.youtubeUrl };
  //   });
  //   if (allBloggers) {
  //     totalPages = Math.ceil((totalCount || 0) / pageSize);
  //   }
  //   return {
  //     pagesCount: totalPages,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: allBloggers,
  //   };
  // }

  async createNewGame(newGameData: {
    userId: ObjectId;
    login: string;
    gameId: ObjectId;
  }): Promise<IGameSchema | string> {
    try {
      const fiveRandomQuestions = _.sampleSize(quizQuestions, 5);
      const listQuestions = await Promise.all(
        fiveRandomQuestions.map(async (el) => {
          const questionId = new ObjectId();
          const newQuestion = new Questions({ _id: questionId, body: el.body, correctAnswer: el.correctAnswer });
          const question = await Questions.create(newQuestion);
          return question;
        }),
      );

      const playerId = new ObjectId();
      await this.playersRepositoryDB.createNewPlayers({
        userId: newGameData.userId,
        playerId,
        gameId: newGameData.gameId,
        login: newGameData.login,
      });
      const newGame = new Games({
        _id: newGameData.userId,
        firstPlayerId: playerId,
        questions: listQuestions,
        gameStatus: 'PendingSecondPlayer',
        secondPlayerId: null,
        pairCreatedDate: null,
        startGameDate: new Date(),
        finishGameDate: null,
        firstPlayerScore: null,
        secondPlayerScore: null,
        winnerUserId: null,
      });

      await Games.create(newGame);
      return newGame;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async createPair(gamePairData: {
    gameId: ObjectId;
    secondPlayerId: ObjectId;
    login: string;
  }): Promise<IGameSchema | string | null> {
    try {
      const secondPlayerId = new ObjectId();
      await this.playersRepositoryDB.createNewPlayers({
        userId: gamePairData.secondPlayerId,
        playerId: secondPlayerId,
        gameId: gamePairData.gameId,
        login: gamePairData.login,
      });
      const update = { gameStatus: 'Active', secondPlayerId: secondPlayerId, pairCreatedDate: new Date() };
      return await Games.findByIdAndUpdate(gamePairData.gameId, { $set: update }, { new: true });
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async getStartedGame() {
    const game = await Games.find({ gameStatus: 'PendingSecondPlayer' }).exec();
    return game;
  }
  // async upDateBlogger(name: string, youtubeUrl: string, id: string) {
  //   try {
  //     return await Bloggers.findByIdAndUpdate(id, { $set: { name, youtubeUrl } });
  //   } catch (err) {
  //     return `Fail in DB: ${err}`;
  //   }
  // }
  // async deleteBlogger(id: string) {
  //   try {
  //     const idVal = new ObjectId(id);
  //     return await Bloggers.findByIdAndDelete(idVal);
  //   } catch (err) {
  //     return `Fail in DB: ${err}`;
  //   }
  // }
}