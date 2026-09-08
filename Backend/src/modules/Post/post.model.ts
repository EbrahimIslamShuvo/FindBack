import {
    Schema,
    model,
} from "mongoose";

import {
    IPost,
} from "./post.interface.js";


const commentSchema =
    new Schema(
        {
            userId: {
                type:
                    Schema.Types.ObjectId,

                ref: "User",

                required: true,
            },

            text: {
                type: String,

                required: true,

                trim: true,

                maxlength: 1000,
            },
        },

        {
            timestamps: true,
        }
    );


const postSchema =
    new Schema<IPost>(
        {

            userId: {

                type:
                    Schema.Types.ObjectId,

                ref: "User",

                required: true,

                index: true,
            },


            postType: {

                type: String,

                enum: [
                    "FIND",
                    "LOST",
                ],

                required: true,

                index: true,
            },


            description: {

                type: String,

                trim: true,

                default: "",

                maxlength: 5000,
            },


            images: {

                type: [String],

                default: [],
            },


            layout: {

                type: String,

                enum: [
                    "grid",
                    "horizontal",
                    "vertical",
                ],

                default: "grid",
            },


            status: {

                type: String,

                enum: [
                    "ACTIVE",
                    "CLAIMED",
                    "RETURNED",
                ],

                default: "ACTIVE",

                index: true,
            },


            likes: [

                {

                    type:
                        Schema.Types.ObjectId,

                    ref: "User",

                },

            ],


            savedBy: [

                {

                    type:
                        Schema.Types.ObjectId,

                    ref: "User",

                },

            ],


            comments: {

                type:
                    [commentSchema],

                default: [],
            },

        },

        {

            timestamps: true,

        }
    );


// ==========================================
// INDEX FOR AI SEARCH
// ==========================================

postSchema.index({
    postType: 1,
    status: 1,
    createdAt: -1,
});


const Post =
    model<IPost>(
        "Post",
        postSchema
    );


export default Post;