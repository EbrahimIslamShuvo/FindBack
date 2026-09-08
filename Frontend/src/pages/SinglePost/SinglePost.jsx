import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
    GoBookmark,
    GoBookmarkFill,
} from "react-icons/go";

import {
    FaRegCommentDots,
} from "react-icons/fa";

import {
    AiFillLike,
    AiOutlineLike,
} from "react-icons/ai";

import {
    MdOutlineAssignmentTurnedIn,
} from "react-icons/md";

const API_URL = "http://localhost:3000";

const SinglePost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    // ==========================================
    // USER
    // ==========================================

    const storedUser =
        localStorage.getItem("findback_user");

    const currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;

    const token =
        localStorage.getItem("findback_token");

    // ==========================================
    // STATES
    // ==========================================

    const [post, setPost] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [currentImage, setCurrentImage] =
        useState(0);

    const [liked, setLiked] =
        useState(false);

    const [saved, setSaved] =
        useState(false);

    const [likesCount, setLikesCount] =
        useState(0);

    const [comments, setComments] =
        useState([]);

    const [commentText, setCommentText] =
        useState("");

    const [likeLoading, setLikeLoading] =
        useState(false);

    const [saveLoading, setSaveLoading] =
        useState(false);

    const [commentLoading, setCommentLoading] =
        useState(false);

    // ==========================================
    // FETCH SINGLE POST
    // ==========================================

    useEffect(() => {
        console.log(
            "========== SINGLE POST =========="
        );

        console.log(
            "Current URL:",
            window.location.href
        );

        console.log(
            "Post ID:",
            postId
        );

        if (!postId) {
            setError("Post ID is missing.");
            setLoading(false);
            return;
        }

        const fetchPost = async () => {
            try {
                setLoading(true);
                setError("");

                const url =
                    `${API_URL}/api/posts/${postId}`;

                console.log(
                    "REQUEST:",
                    url
                );

                const response =
                    await axios.get(
                        url,
                        {
                            timeout: 10000,
                        }
                    );

                console.log(
                    "POST RESPONSE:",
                    response.data
                );

                const responseData =
                    response.data;

                let fetchedPost =
                    responseData?.data;

                /*
                    Supports:

                    {
                        success: true,
                        data: post
                    }

                    OR

                    {
                        success: true,
                        data: {
                            post: post
                        }
                    }
                */

                if (
                    fetchedPost?.post
                ) {
                    fetchedPost =
                        fetchedPost.post;
                }

                if (
                    !fetchedPost?._id
                ) {
                    throw new Error(
                        "Invalid post data received."
                    );
                }

                setPost(
                    fetchedPost
                );

                setLikesCount(
                    fetchedPost?.likes
                        ?.length || 0
                );

                setComments(
                    fetchedPost?.comments || []
                );

                // ==================================
                // LIKE / SAVE STATUS
                // ==================================

                if (currentUser) {
                    const currentUserId =
                        currentUser?._id ||
                        currentUser?.id;

                    const isLiked =
                        fetchedPost?.likes?.some(
                            (id) =>
                                String(
                                    id?._id ||
                                    id
                                ) ===
                                String(
                                    currentUserId
                                )
                        );

                    const isSaved =
                        fetchedPost?.savedBy?.some(
                            (id) =>
                                String(
                                    id?._id ||
                                    id
                                ) ===
                                String(
                                    currentUserId
                                )
                        );

                    setLiked(
                        !!isLiked
                    );

                    setSaved(
                        !!isSaved
                    );
                }
            } catch (err) {
                console.error(
                    "SINGLE POST ERROR:",
                    err
                );

                if (
                    err.response?.status ===
                    400
                ) {
                    setError(
                        err.response?.data
                            ?.message ||
                        "Invalid post ID."
                    );
                } else if (
                    err.response?.status ===
                    404
                ) {
                    setError(
                        "Post not found."
                    );
                } else if (
                    err.code ===
                    "ECONNABORTED"
                ) {
                    setError(
                        "Server took too long to respond."
                    );
                } else {
                    setError(
                        err.response?.data
                            ?.message ||
                        err.message ||
                        "Unable to load post."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    // ==========================================
    // IMAGE URL
    // ==========================================

    const getImageUrl = (
        image
    ) => {
        if (!image) {
            return "";
        }

        if (
            image.startsWith(
                "http://"
            ) ||
            image.startsWith(
                "https://"
            )
        ) {
            return image;
        }

        return `${API_URL}/${image.replace(
            /^\/+/,
            ""
        )}`;
    };

    // ==========================================
    // USER IMAGE
    // ==========================================

    const getUserImage = (
        user
    ) => {
        const picture =
            user?.picture;

        const name =
            user?.name ||
            "User";

        if (picture) {
            return getImageUrl(
                picture
            );
        }

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
        )}&background=random`;
    };

    // ==========================================
    // LOGIN
    // ==========================================

    const redirectToLogin = () => {
        navigate("/login");
    };

    // ==========================================
    // CLAIM
    // SAME ROUTE AS POSTCARD
    // ==========================================

    const handleClaim = () => {
        if (
            !token ||
            !currentUser
        ) {
            redirectToLogin();
            return;
        }

        navigate(
            `/claim/${post._id}`
        );
    };

    // ==========================================
    // LIKE
    // SAME API AS POSTCARD
    // ==========================================

    const handleLike = async () => {
        if (!token) {
            redirectToLogin();
            return;
        }

        if (likeLoading) {
            return;
        }

        try {
            setLikeLoading(true);

            const response =
                await axios.post(
                    `${API_URL}/api/posts/${post._id}/like`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const result =
                response.data?.data;

            if (result) {
                setLiked(
                    !!result.liked
                );

                setLikesCount(
                    result.likeCount ??
                    result.likesCount ??
                    0
                );
            }
        } catch (error) {
            console.error(
                "Like error:",
                error?.response
                    ?.data ||
                error
            );

            if (
                error?.response
                    ?.status === 401
            ) {
                localStorage.removeItem(
                    "findback_token"
                );

                localStorage.removeItem(
                    "findback_user"
                );

                redirectToLogin();
                return;
            }

            alert(
                error?.response
                    ?.data?.message ||
                "Failed to like post."
            );
        } finally {
            setLikeLoading(false);
        }
    };

    // ==========================================
    // SAVE
    // SAME API AS POSTCARD
    // ==========================================

    const handleSave = async () => {
        if (!token) {
            redirectToLogin();
            return;
        }

        if (saveLoading) {
            return;
        }

        try {
            setSaveLoading(true);

            const response =
                await axios.post(
                    `${API_URL}/api/posts/${post._id}/save`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const result =
                response.data?.data;

            if (result) {
                setSaved(
                    !!result.saved
                );
            }
        } catch (error) {
            console.error(
                "Save error:",
                error?.response
                    ?.data ||
                error
            );

            if (
                error?.response
                    ?.status === 401
            ) {
                localStorage.removeItem(
                    "findback_token"
                );

                localStorage.removeItem(
                    "findback_user"
                );

                redirectToLogin();
                return;
            }

            alert(
                error?.response
                    ?.data?.message ||
                "Failed to save post."
            );
        } finally {
            setSaveLoading(false);
        }
    };

    // ==========================================
    // COMMENT
    // SAME API AS POSTCARD
    // ==========================================

    const handleComment = async (
        e
    ) => {
        e.preventDefault();

        if (!token) {
            redirectToLogin();
            return;
        }

        const text =
            commentText.trim();

        if (!text) {
            return;
        }

        if (commentLoading) {
            return;
        }

        try {
            setCommentLoading(
                true
            );

            const response =
                await axios.post(
                    `${API_URL}/api/posts/${post._id}/comment`,
                    {
                        text,
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const newComment =
                response.data?.data;

            if (newComment) {
                setComments(
                    (prev) => [
                        ...prev,
                        newComment,
                    ]
                );
            }

            setCommentText("");
        } catch (error) {
            console.error(
                "Comment error:",
                error?.response
                    ?.data ||
                error
            );

            if (
                error?.response
                    ?.status === 401
            ) {
                localStorage.removeItem(
                    "findback_token"
                );

                localStorage.removeItem(
                    "findback_user"
                );

                redirectToLogin();
                return;
            }

            alert(
                error?.response
                    ?.data?.message ||
                "Failed to add comment."
            );
        } finally {
            setCommentLoading(
                false
            );
        }
    };

    // ==========================================
    // IMAGE NAVIGATION
    // ==========================================

    const images =
        post?.images || [];

    const totalImages =
        images.length;

    const nextImage = () => {
        if (
            totalImages <= 1
        ) {
            return;
        }

        setCurrentImage(
            (prev) =>
                (prev + 1) %
                totalImages
        );
    };

    const previousImage = () => {
        if (
            totalImages <= 1
        ) {
            return;
        }

        setCurrentImage(
            (prev) =>
                prev === 0
                    ? totalImages - 1
                    : prev - 1
        );
    };

    // ==========================================
    // DATE
    // ==========================================

    const getDate = () => {
        if (!post?.createdAt) {
            return "";
        }

        return new Date(
            post.createdAt
        ).toLocaleString();
    };

    // ==========================================
    // POST TYPE
    // ==========================================

    const isLost =
        post?.postType ===
        "LOST";

    const isFound =
        post?.postType ===
            "FIND" ||
        post?.postType ===
            "FOUND";

    // ==========================================
    // OWNER
    // ==========================================

    const currentUserId =
        currentUser?._id ||
        currentUser?.id;

    const postOwnerId =
        post?.userId?._id ||
        post?.userId;

    const isOwnPost =
        currentUserId &&
        postOwnerId &&
        String(
            currentUserId
        ) ===
            String(
                postOwnerId
            );

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="mt-4 text-sm text-gray-600">
                        Loading post...
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                        ID:{" "}
                        {postId ||
                            "undefined"}
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                        ⚠️
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                        Unable to load post
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        {error}
                    </p>

                    <p className="mt-3 break-all text-xs text-gray-400">
                        ID:{" "}
                        {postId ||
                            "undefined"}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                -1
                            )
                        }
                        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-50">

            {/* =====================================
                TOP BAR
            ===================================== */}

            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                -1
                            )
                        }
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        ← Back
                    </button>

                    <span
                        className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                            isLost
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                        }`}
                    >
                        {isLost
                            ? "LOST"
                            : "FOUND"}
                    </span>
                </div>
            </div>

            {/* =====================================
                MAIN CARD
            ===================================== */}

            <main className="mx-auto max-w-6xl px-4 py-6">

                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="grid grid-cols-1 lg:grid-cols-2">

                        {/* =================================
                            LEFT - IMAGE
                        ================================= */}

                        <div className="relative bg-gray-100">

                            {totalImages >
                            0 ? (
                                <div className="relative flex min-h-[400px] items-center justify-center bg-gray-100 lg:min-h-[650px]">

                                    <img
                                        src={getImageUrl(
                                            images[
                                                currentImage
                                            ]
                                        )}
                                        alt={
                                            post.description ||
                                            "Post"
                                        }
                                        className="max-h-[650px] w-full object-contain"
                                        onError={(
                                            e
                                        ) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />

                                    {/* IMAGE COUNT */}

                                    {totalImages >
                                        1 && (
                                        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
                                            {currentImage +
                                                1}{" "}
                                            /{" "}
                                            {
                                                totalImages
                                            }
                                        </div>
                                    )}

                                    {/* PREVIOUS */}

                                    {totalImages >
                                        1 && (
                                        <button
                                            type="button"
                                            onClick={
                                                previousImage
                                            }
                                            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/70"
                                        >
                                            ‹
                                        </button>
                                    )}

                                    {/* NEXT */}

                                    {totalImages >
                                        1 && (
                                        <button
                                            type="button"
                                            onClick={
                                                nextImage
                                            }
                                            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/70"
                                        >
                                            ›
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex min-h-[400px] items-center justify-center text-gray-400 lg:min-h-[650px]">
                                    <div className="text-center">
                                        <div className="text-5xl">
                                            📷
                                        </div>

                                        <p className="mt-3 text-sm">
                                            No image available
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* IMAGE DOTS */}

                            {totalImages >
                                1 && (
                                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-3 py-2">
                                    {images.map(
                                        (
                                            _,
                                            index
                                        ) => (
                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setCurrentImage(
                                                        index
                                                    )
                                                }
                                                className={`h-2 rounded-full transition-all ${
                                                    index ===
                                                    currentImage
                                                        ? "w-6 bg-white"
                                                        : "w-2 bg-white/50"
                                                }`}
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =================================
                            RIGHT CONTENT
                        ================================= */}

                        <div className="flex flex-col">

                            {/* =================================
                                POSTER
                            ================================= */}

                            <div className="border-b border-gray-100 p-5">

                                <div className="flex items-center justify-between">

                                    <div className="flex min-w-0 items-center gap-3">

                                        <img
                                            src={getUserImage(
                                                post.userId
                                            )}
                                            alt={
                                                post.userId
                                                    ?.name ||
                                                "User"
                                            }
                                            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                                            onError={(
                                                e
                                            ) => {
                                                e.currentTarget.src =
                                                    getUserImage(
                                                        {
                                                            name:
                                                                post.userId
                                                                    ?.name ||
                                                                "User",
                                                        }
                                                    );
                                            }}
                                        />

                                        <div className="min-w-0">

                                            <h2 className="truncate font-semibold text-gray-900">
                                                {post.userId
                                                    ?.name ||
                                                    "Unknown User"}
                                            </h2>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {getDate()}
                                            </p>

                                        </div>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            post.status ===
                                            "RETURNED"
                                                ? "bg-green-100 text-green-700"
                                                : post.status ===
                                                  "CLAIMED"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        {post.status}
                                    </span>

                                </div>
                            </div>

                            {/* =================================
                                DESCRIPTION
                            ================================= */}

                            <div className="flex-1 p-5">

                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        {isLost
                                            ? "Lost Item"
                                            : "Found Item"}
                                    </p>

                                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
                                        {post.description ||
                                            "No description provided."}
                                    </p>
                                </div>

                                {/* =================================
                                    STATS
                                ================================= */}

                                <div className="mt-6 flex items-center justify-between border-y border-gray-100 py-3 text-sm text-gray-500">

                                    <span>
                                        {likesCount}{" "}
                                        {likesCount ===
                                        1
                                            ? "Like"
                                            : "Likes"}
                                    </span>

                                    <span>
                                        {comments.length}{" "}
                                        {comments.length ===
                                        1
                                            ? "Comment"
                                            : "Comments"}
                                    </span>
                                </div>

                                {/* =================================
                                    ACTION BUTTONS
                                ================================= */}

                                <div
                                    className={`mt-1 grid ${
                                        isFound &&
                                        !isOwnPost
                                            ? "grid-cols-4"
                                            : "grid-cols-3"
                                    }`}
                                >

                                    {/* LIKE */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleLike
                                        }
                                        disabled={
                                            likeLoading
                                        }
                                        className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition hover:bg-gray-50 ${
                                            liked
                                                ? "text-blue-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        <span className="text-xl">
                                            {liked ? (
                                                <AiFillLike />
                                            ) : (
                                                <AiOutlineLike />
                                            )}
                                        </span>

                                        <span>
                                            {liked
                                                ? "Liked"
                                                : "Like"}
                                        </span>
                                    </button>

                                    {/* COMMENT */}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            document
                                                .getElementById(
                                                    "comments-section"
                                                )
                                                ?.scrollIntoView(
                                                    {
                                                        behavior:
                                                            "smooth",
                                                    }
                                                );
                                        }}
                                        className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                    >
                                        <span className="text-lg">
                                            <FaRegCommentDots />
                                        </span>

                                        <span>
                                            Comment
                                        </span>
                                    </button>

                                    {/* SAVE */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleSave
                                        }
                                        disabled={
                                            saveLoading
                                        }
                                        className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition hover:bg-gray-50 ${
                                            saved
                                                ? "text-blue-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        <span className="text-lg">
                                            {saved ? (
                                                <GoBookmarkFill />
                                            ) : (
                                                <GoBookmark />
                                            )}
                                        </span>

                                        <span>
                                            {saveLoading
                                                ? "Saving..."
                                                : saved
                                                ? "Saved"
                                                : "Save"}
                                        </span>
                                    </button>

                                    {/* CLAIM */}

                                    {isFound &&
                                        !isOwnPost && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleClaim
                                                }
                                                className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                                            >
                                                <span className="text-lg">
                                                    <MdOutlineAssignmentTurnedIn />
                                                </span>

                                                <span>
                                                    Claim
                                                </span>
                                            </button>
                                        )}
                                </div>

                            </div>

                            {/* =================================
                                COMMENTS
                            ================================= */}

                            <div
                                id="comments-section"
                                className="border-t border-gray-200 bg-gray-50 p-5"
                            >

                                <h3 className="text-base font-bold text-gray-900">
                                    Comments{" "}
                                    <span className="font-normal text-gray-400">
                                        (
                                        {
                                            comments.length
                                        }
                                        )
                                    </span>
                                </h3>

                                {/* ADD COMMENT */}

                                <form
                                    onSubmit={
                                        handleComment
                                    }
                                    className="mt-4 flex gap-2"
                                >

                                    <img
                                        src={
                                            getUserImage(
                                                currentUser
                                            )
                                        }
                                        alt="You"
                                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            commentText
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCommentText(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Write a comment..."
                                        className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <button
                                        type="submit"
                                        disabled={
                                            commentLoading ||
                                            !commentText.trim()
                                        }
                                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {commentLoading
                                            ? "..."
                                            : "Post"}
                                    </button>

                                </form>

                                {/* COMMENT LIST */}

                                <div className="mt-5 space-y-4">

                                    {comments.length ===
                                    0 ? (
                                        <div className="rounded-xl bg-white py-8 text-center">
                                            <FaRegCommentDots className="mx-auto text-2xl text-gray-300" />

                                            <p className="mt-2 text-sm text-gray-500">
                                                No comments yet.
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                Be the first to comment.
                                            </p>
                                        </div>
                                    ) : (
                                        comments.map(
                                            (
                                                comment,
                                                index
                                            ) => {
                                                const commentUser =
                                                    comment?.userId;

                                                return (
                                                    <div
                                                        key={
                                                            comment?._id ||
                                                            index
                                                        }
                                                        className="flex gap-3"
                                                    >

                                                        <img
                                                            src={getUserImage(
                                                                commentUser
                                                            )}
                                                            alt={
                                                                commentUser
                                                                    ?.name ||
                                                                "User"
                                                            }
                                                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                                                        />

                                                        <div className="min-w-0 rounded-2xl bg-white px-4 py-2.5 shadow-sm">

                                                            <p className="text-xs font-semibold text-gray-900">
                                                                {commentUser
                                                                    ?.name ||
                                                                    "User"}
                                                            </p>

                                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-gray-700">
                                                                {
                                                                    comment?.text
                                                                }
                                                            </p>

                                                            {comment?.createdAt && (
                                                                <p className="mt-1 text-[10px] text-gray-400">
                                                                    {new Date(
                                                                        comment.createdAt
                                                                    ).toLocaleString()}
                                                                </p>
                                                            )}

                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
};

export default SinglePost;