import express from 'express';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { GamesRepositoryDB } from '../repositories/games-repository-db';
import { PlayersRepositoryDB } from '../repositories/players-repository-db';
import { CheckTimerService } from './check-timer-service';

@injectable()
export class QuizService {
  constructor(
    @inject(PlayersRepositoryDB) protected playersRepositoryDB: PlayersRepositoryDB,
    @inject(GamesRepositoryDB) protected gamesRepositoryDB: GamesRepositoryDB,
    @inject(CheckTimerService) protected checkTimerService: CheckTimerService,
  ) {}

  async getActivePlayerAndGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    const player = await this.playersRepositoryDB.findActivePlayerByUserId(req.user!._id!);
    if (typeof player !== 'string' && player) {
      req.currentPlayer = player;
      const activeGame = await this.gamesRepositoryDB.getActiveGameById(player!.gameId);
      if (typeof activeGame !== 'string' && activeGame) {
        const firstPlayer = await this.playersRepositoryDB.getPlayerById(activeGame.firstPlayerId);
        const secondPlayer = await this.playersRepositoryDB.getPlayerById(activeGame.secondPlayerId);
        const gameFirstPlayer = await this.checkTimerService.checkTimer(firstPlayer!);
        const gameSecondPlayer = await this.checkTimerService.checkTimer(secondPlayer!);
        if (gameFirstPlayer === 'gameOver' || gameSecondPlayer === 'gameOver') {
          return res.status(403);
        }
        req.currentActiveGame = activeGame;
      }
      if (typeof activeGame === 'string') {
        return res.status(400).send(`Dd error: ${activeGame}`);
      }
    }
    if (typeof player === 'string') {
      return res.status(400).send(`Dd error: ${player}`);
    }
    return next();
  }
}
