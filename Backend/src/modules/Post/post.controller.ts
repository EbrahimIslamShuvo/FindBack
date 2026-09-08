import {
  Request,
  Response,
} from "express";

import {
  createPost,
  getAllPosts,
  getMyPosts,
  getSinglePost,
  toggleLike,
  toggleSave,
  addComment,
  deletePost,
  getSavedPosts,
} from "./post.service.js";


// ==================================================
// CREATE POST
// ==================================================

export const createPostController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any)
          .user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized user",
          });
      }

      const {
        postType,
        description,
        layout,
      } = req.body;

      // Validate post type
      if (
        ![
          "FIND",
          "LOST",
        ].includes(
          postType
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Post type must be FIND or LOST",
          });
      }

      // Validate layout
      const validLayouts = [
        "grid",
        "horizontal",
        "vertical",
      ];

      const selectedLayout =
        validLayouts.includes(
          layout
        )
          ? layout
          : "grid";

      // Files
      const files =
        (req.files as Express.Multer.File[]) ||
        [];

      const images =
        files.map(
          (file) =>
            `/uploads/posts/${file.filename}`
        );

      // Must have text or image
      if (
        !description?.trim() &&
        images.length === 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Description or image is required",
          });
      }

      // Create
      const post =
        await createPost({
          userId,

          postType,

          description:
            description?.trim() ||
            "",

          images,

          layout:
            selectedLayout,

          status:
            "ACTIVE",

          likes: [],

          savedBy: [],

          comments: [],
        });

      // Populate user
      const populatedPost =
        await post.populate(
          "userId",
          "name email picture userType"
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Post created successfully",

          data:
            populatedPost,
        });

    } catch (error: any) {

      console.error(
        "Create post error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to create post",
        });
    }
  };


// ==================================================
// GET ALL POSTS
// ==================================================

export const getAllPostsController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const posts =
        await getAllPosts();

      return res
        .status(200)
        .json({
          success: true,
          data: posts,
        });

    } catch (error: any) {

      console.error(
        "Get all posts error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to get posts",
        });
    }
  };


// ==================================================
// GET MY POSTS
// ==================================================

export const getMyPostsController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any)
          .user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized user",
          });
      }

      const posts =
        await getMyPosts(
          userId
        );

      return res
        .status(200)
        .json({
          success: true,
          data: posts,
        });

    } catch (error: any) {

      console.error(
        "Get my posts error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to get my posts",
        });
    }
  };


// ==================================================
// GET SINGLE POST
// ==================================================

export const getSinglePostController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { postId } = req.params;

      console.log(
        "Getting single post:",
        postId
      );

      const post =
        await getSinglePost(postId as any);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: post,
      });

    } catch (error: any) {

      console.error(
        "GET SINGLE POST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get post",
      });
    }
  };


// ==================================================
// LIKE
// ==================================================

export const toggleLikeController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any)
          .user?.id;

      const {
        postId,
      } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized",
          });
      }

      const result =
        await toggleLike(
          postId as any,
          userId
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            result.liked
              ? "Post liked"
              : "Post unliked",

          data: result,
        });

    } catch (error: any) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to like post",
        });
    }
  };


// ==================================================
// SAVE
// ==================================================

export const toggleSaveController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any)
          .user?.id;

      const {
        postId,
      } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized",
          });
      }

      const result =
        await toggleSave(
          postId as any,
          userId
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            result.saved
              ? "Post saved"
              : "Post removed from saved",

          data: result,
        });

    } catch (error: any) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to save post",
        });
    }
  };


// ==================================================
// COMMENT
// ==================================================

export const addCommentController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any)
          .user?.id;

      const {
        postId,
      } = req.params;

      const {
        text,
      } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized",
          });
      }

      if (
        !text ||
        !text.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Comment is required",
          });
      }

      const post =
        await addComment(
          postId as any,
          userId,
          text
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Comment added successfully",

          data: post,
        });

    } catch (error: any) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to add comment",
        });
    }
  };


// ==================================================
// DELETE POST
// ==================================================

export const deletePostController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any)
          .user?.id;

      const {
        postId,
      } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized",
          });
      }

      await deletePost(
        postId as any,
        userId
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Post deleted successfully",
        });

    } catch (error: any) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to delete post",
        });
    }
  };


export const getSavedPostsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        (req as any).user?.id;

      console.log(
        "Saved posts user:",
        userId
      );

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const posts =
        await getSavedPosts(userId);

      return res.status(200).json({
        success: true,
        message: "Saved posts fetched successfully",
        data: posts,
      });

    } catch (error: any) {

      console.error(
        "GET SAVED POSTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Failed to get saved posts",
      });
    }
  };