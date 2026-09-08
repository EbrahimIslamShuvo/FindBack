import { Types } from "mongoose";
import Post from "./post.model.js";

// ==================================================
// CREATE POST
// ==================================================

export const createPost =
    async (
        postData: any
    ) => {
        const post =
            await Post.create(
                postData
            );

        return post;
    };


// ==================================================
// GET ALL POSTS
// ==================================================

export const getAllPosts =
    async () => {
        const posts =
            await Post.find()
                .populate(
                    "userId",
                    "name email picture userType"
                )
                .populate(
                    "comments.userId",
                    "name picture"
                )
                .sort({
                    createdAt: -1,
                });

        return posts;
    };


// ==================================================
// GET MY POSTS
// ==================================================

export const getMyPosts =
    async (
        userId: string
    ) => {
        const posts =
            await Post.find({
                userId,
            })
                .populate(
                    "userId",
                    "name email picture userType"
                )
                .populate(
                    "comments.userId",
                    "name picture"
                )
                .sort({
                    createdAt: -1,
                });

        return posts;
    };


// ==================================================
// GET SINGLE POST
// ==================================================

export const getSinglePost =
    async (
        postId: string
    ) => {
        const post =
            await Post.findById(
                postId
            )
                .populate(
                    "userId",
                    "name email picture userType"
                )
                .populate(
                    "comments.userId",
                    "name picture"
                );

        return post;
    };


// ==================================================
// LIKE / UNLIKE
// ==================================================

export const toggleLike =
    async (
        postId: string,
        userId: string
    ) => {

        const post =
            await Post.findById(
                postId
            );

        if (!post) {
            throw new Error(
                "Post not found"
            );
        }

        const alreadyLiked =
            post.likes.some(
                (id) =>
                    id.toString() ===
                    userId
            );

        if (alreadyLiked) {

            post.likes =
                post.likes.filter(
                    (id) =>
                        id.toString() !==
                        userId
                );

        } else {

            post.likes.push(
                userId as any
            );

        }

        await post.save();

        return {
            liked:
                !alreadyLiked,

            likeCount:
                post.likes.length,
        };
    };


// ==================================================
// SAVE / UNSAVE
// ==================================================

export const toggleSave =
    async (
        postId: string,
        userId: string
    ) => {

        const post =
            await Post.findById(
                postId
            );

        if (!post) {
            throw new Error(
                "Post not found"
            );
        }

        const alreadySaved =
            post.savedBy.some(
                (id) =>
                    id.toString() ===
                    userId
            );

        if (alreadySaved) {

            post.savedBy =
                post.savedBy.filter(
                    (id) =>
                        id.toString() !==
                        userId
                );

        } else {

            post.savedBy.push(
                userId as any
            );

        }

        await post.save();

        return {
            saved:
                !alreadySaved,

            saveCount:
                post.savedBy.length,
        };
    };


// ==================================================
// ADD COMMENT
// ==================================================

export const addComment =
    async (
        postId: string,
        userId: string,
        text: string
    ) => {

        const post =
            await Post.findById(
                postId
            );

        if (!post) {
            throw new Error(
                "Post not found"
            );
        }

        if (!text?.trim()) {
            throw new Error(
                "Comment cannot be empty"
            );
        }

        post.comments.push({
            userId:
                userId as any,

            text:
                text.trim(),
        });

        await post.save();

        const updatedPost =
            await Post.findById(
                postId
            )
                .populate(
                    "userId",
                    "name email picture userType"
                )
                .populate(
                    "comments.userId",
                    "name picture"
                );

        return updatedPost;
    };


// ==================================================
// DELETE POST
// ==================================================

export const deletePost =
    async (
        postId: string,
        userId: string
    ) => {

        const post =
            await Post.findById(
                postId
            );

        if (!post) {
            throw new Error(
                "Post not found"
            );
        }

        if (
            post.userId.toString() !==
            userId
        ) {
            throw new Error(
                "You can only delete your own post"
            );
        }

        await Post.findByIdAndDelete(
            postId
        );

        return true;
    };

export const getSavedPosts = async (
    userId: string
) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    const posts = await Post.find({
        savedBy: new Types.ObjectId(userId),
    })
        .populate(
            "userId",
            "name email picture userType"
        )
        .populate(
            "comments.userId",
            "name picture"
        )
        .sort({
            createdAt: -1,
        });

    return posts;
};