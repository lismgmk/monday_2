import { ObjectId } from 'mongodb';
import mongoose, { Types } from 'mongoose';

export enum myStatus {
  None,
  Like,
  Dislike,
}
export interface IBloggers {
  id?: Types.ObjectId;
  name?: string;
  youtubeUrl?: string;
}
export interface ILikes {
  _id: Types.ObjectId;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  // myStatus: myStatus;
  myStatus: any;
  addedAt: Date;
  likesCount: number;
  dislikesCount: number;
  newestLikes: INewestLikes[];
}

export interface IBlackList {
  id: ObjectId;
  tokenValue?: string;
}

export interface IComments {
  id: Types.ObjectId;
  content?: string | null;
  userId?: Types.ObjectId;
  addedAt?: Date | null;
  postId?: Types.ObjectId;
}

export interface IUser {
  _id?: Types.ObjectId;
  accountData: {
    userName: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    userIp: string;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
    attemptCount: number;
  };
}

export interface IIpUser {
  id?: Types.ObjectId;
  createdAt: Date;
  userIp: string;
  path: string;
}

export interface IUsersRes {
  id?: string;
  login?: string | null;
}

export interface IPosts {
  _id?: Types.ObjectId;
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId?: string;
  extendedLikesInfo: Types.ObjectId;
}

export interface INewestLikes {
  addedAt: string;
  userId: string;
  login: string;
}

export interface IExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: myStatus;
  newestLikes: INewestLikes[];
}

export interface IPostsResponse {
  id: string;
  shortDescription?: string;
  content?: string | null;
  title: string | null;
  bloggerId: string;
  bloggerName: string;
  addedAt: string;
  extendedLikesInfo: IExtendedLikesInfo;
}

export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}
