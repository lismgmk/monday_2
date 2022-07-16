import { collections } from '../connect-db';
import { Posts } from '../models/bloggers';
import { IPaginationResponse } from '../types';

export interface IPosts {
  id: number;
  title: string | null;
  shortDescription: string;
  content: string | null;
  bloggerId: number;
  bloggerName: string | null;
}

export const posts: IPosts[] = [];

export const postsRepositoryDB = {
  async getAllPosts(pageSize: number, pageNumber: number): Promise<IPaginationResponse<Posts>> {
    let postsPortion: Posts[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const allBloggersPosts = await collections.posts?.find();
    if (allBloggersPosts) {
      postsPortion = await collections.posts
        ?.find()
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .toArray();
      totalCount = await collections.posts?.find().count();
      totalPages = Math.ceil((totalCount || 0) / pageSize);
    }
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: postsPortion,
    };
  },
  async createPost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>): Promise<Omit<Posts, '_id'> | undefined> {
    const newPost: Omit<Posts, '_id'> = {
      id: +new Date(),
      bloggerName: `blogger${posts.length + 1}`,
      ...bodyParams,
    };
    const insertPost = await collections.posts?.insertOne({ ...newPost });
    if (insertPost) {
      return newPost;
    }
  },
  async getPostById(id: number): Promise<Posts | undefined> {
    const post = (await collections.posts?.findOne({ id })) as unknown as Posts;
    return post;
  },
  async upDatePost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>, id: number) {
    const newPost = {
      title: bodyParams.title,
      shortDescription: bodyParams.shortDescription,
      content: bodyParams.content,
      bloggerId: bodyParams.bloggerId,
      id: +new Date(),
    };
    const updatedPost = await collections.posts?.updateOne({ id }, { $set: newPost });
    return updatedPost;
  },
  async deletePost(id: number) {
    const result = await collections.posts?.deleteOne({ id: id });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};