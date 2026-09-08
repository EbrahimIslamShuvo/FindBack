import { Router } from "express";

import {
  createPostController,
  getAllPostsController,
  getMyPostsController,
  getSavedPostsController,
  getSinglePostController,
  toggleLikeController,
  toggleSaveController,
  addCommentController,
  deletePostController,
} from "./post.controller.js";

import {
  uploadPostImages,
} from "./post.upload.js";

import authMiddleware from "../../middleware/auth.middleware.js";

const router = Router();


// CREATE POST
router.post(
  "/create",
  authMiddleware,
  uploadPostImages.array("images", 10),
  createPostController
);


// ALL POSTS
router.get(
  "/",
  getAllPostsController
);


// MY POSTS
router.get(
  "/my-posts",
  authMiddleware,
  getMyPostsController
);


// SAVED POSTS
// IMPORTANT: must be before /:postId
router.get(
  "/saved",
  authMiddleware,
  getSavedPostsController
);


// LIKE
router.post(
  "/:postId/like",
  authMiddleware,
  toggleLikeController
);


// SAVE
router.post(
  "/:postId/save",
  authMiddleware,
  toggleSaveController
);


// COMMENT
router.post(
  "/:postId/comment",
  authMiddleware,
  addCommentController
);


// DELETE
router.delete(
  "/:postId",
  authMiddleware,
  deletePostController
);


// SINGLE POST
// MUST BE LAST
router.get(
  "/:postId",
  getSinglePostController
);


export default router;