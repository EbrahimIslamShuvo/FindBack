import { Types } from "mongoose";

export type PostType =
  | "FIND"
  | "LOST";

export type PostLayout =
  | "grid"
  | "horizontal"
  | "vertical";

export type PostStatus =
  | "ACTIVE"
  | "CLAIMED"
  | "RETURNED";

export interface IPostComment {
  userId: Types.ObjectId;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPost {
  userId: Types.ObjectId;

  postType: PostType;

  description: string;

  images: string[];

  layout: PostLayout;

  status: PostStatus;

  likes: Types.ObjectId[];

  savedBy: Types.ObjectId[];

  comments: IPostComment[];

  createdAt?: Date;
  updatedAt?: Date;
}