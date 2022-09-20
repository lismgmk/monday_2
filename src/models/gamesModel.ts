import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { db_games_collection_name_str } from '../connect-db';
import { IGameStatus } from '../types';
import { questionSchema } from './questionsModel';

const { Schema } = mongoose;
export interface IGameSchema {
  _id: ObjectId;
  gameStatus: IGameStatus;
  questions: ObjectId[];
  firstPlayerId: ObjectId;
  secondPlayerId: ObjectId;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  winnerUserId: ObjectId;
}

export const gamesSchema = new Schema<IGameSchema>(
  {
    _id: ObjectId,
    gameStatus: {
      type: String,
      required: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
    firstPlayerId: {
      type: Schema?.Types.ObjectId,
      required: true,
    },
    secondPlayerId: {
      type: Schema?.Types.ObjectId,
      required: false,
    },
    pairCreatedDate: Date,
    startGameDate: Date,
    finishGameDate: Date,
    winnerUserId: Schema?.Types.ObjectId,
  },
  { versionKey: false },
);
export const Games = mongoose.model<IGameSchema>('Games', gamesSchema, db_games_collection_name_str);
