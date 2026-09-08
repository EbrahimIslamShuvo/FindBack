
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { GoBookmark, GoBookmarkFill } from "react-icons/go";
import { FaRegCommentDots } from "react-icons/fa";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";

const API_URL = "http://localhost:3000";

const PostCard = ({
  post,
  onUnsave,
}) => {
  const navigate = useNavigate();

  // ==============================
  // USER
  // ==============================

  const storedUser =
    localStorage.getItem("findback_user");

  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const token =
    localStorage.getItem("findback_token");

  // ==============================
  // STATES
  // ==============================

  const [currentImage, setCurrentImage] =
    useState(0);

  const [liked, setLiked] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [likesCount, setLikesCount] =
    useState(
      post?.likes?.length || 0
    );

  const [comments, setComments] =
    useState(
      post?.comments || []
    );

  const [commentText, setCommentText] =
    useState("");

  const [showComments, setShowComments] =
    useState(false);

  const [likeLoading, setLikeLoading] =
    useState(false);

  const [saveLoading, setSaveLoading] =
    useState(false);

  const [commentLoading, setCommentLoading] =
    useState(false);

  // ==============================
  // IMAGES
  // ==============================

  const images =
    post?.images || [];

  const totalImages =
    images.length;

  // ==============================
  // CHECK LIKE / SAVE
  // ==============================

  useEffect(() => {
    if (!currentUser) {
      setLiked(false);
      setSaved(false);
      return;
    }

    const userId =
      currentUser._id ||
      currentUser.id;

    const isLiked =
      post?.likes?.some(
        (id) =>
          String(
            id?._id || id
          ) === String(userId)
      );

    const isSaved =
      post?.savedBy?.some(
        (id) =>
          String(
            id?._id || id
          ) === String(userId)
      );

    setLiked(!!isLiked);
    setSaved(!!isSaved);
  }, [
    post,
    currentUser?._id,
    currentUser?.id,
  ]);

  // ==============================
  // IMAGE URL
  // ==============================

  const getImageUrl = (
    image
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_URL}/${image.replace(
      /^\/+/,
      ""
    )}`;
  };

  // ==============================
  // USER IMAGE
  // ==============================

  const getUserImage = () => {
    const picture =
      post?.userId?.picture;

    const name =
      post?.userId?.name ||
      "User";

    if (picture) {
      return getImageUrl(picture);
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random`;
  };

  // ==============================
  // AUTH REDIRECT
  // ==============================

  const redirectToLogin = () => {
    navigate("/login");
  };

  // ==============================
  // CLAIM
  // ==============================

  const handleClaim = () => {
    if (!token || !currentUser) {
      redirectToLogin();
      return;
    }

    navigate(
      `/claim/${post._id}`
    );
  };

  // ==============================
  // LIKE
  // ==============================

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
        error?.response?.data ||
          error
      );

      if (
        error?.response?.status ===
        401
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
        error?.response?.data
          ?.message ||
          "Failed to like post."
      );
    } finally {
      setLikeLoading(false);
    }
  };

  // ==============================
  // SAVE
  // ==============================

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
        const newSaved =
          !!result.saved;

        setSaved(newSaved);

        if (
          !newSaved &&
          onUnsave
        ) {
          onUnsave(post._id);
        }
      }
    } catch (error) {
      console.error(
        "Save error:",
        error?.response?.data ||
          error
      );

      if (
        error?.response?.status ===
        401
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
        error?.response?.data
          ?.message ||
          "Failed to save post."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // ==============================
  // COMMENT
  // ==============================

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
      setCommentLoading(true);

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
      setShowComments(true);
    } catch (error) {
      console.error(
        "Comment error:",
        error?.response?.data ||
          error
      );

      if (
        error?.response?.status ===
        401
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
        error?.response?.data
          ?.message ||
          "Failed to add comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  // ==============================
  // NEXT IMAGE
  // ==============================

  const nextImage = () => {
    if (totalImages <= 1) {
      return;
    }

    setCurrentImage(
      (prev) =>
        (prev + 1) %
        totalImages
    );
  };

  // ==============================
  // PREVIOUS IMAGE
  // ==============================

  const previousImage = () => {
    if (totalImages <= 1) {
      return;
    }

    setCurrentImage(
      (prev) =>
        prev === 0
          ? totalImages - 1
          : prev - 1
    );
  };

  // ==============================
  // DATE
  // ==============================

  const getDate = () => {
    if (!post?.createdAt) {
      return "";
    }

    return new Date(
      post.createdAt
    ).toLocaleString();
  };

  // ==============================
  // POST TYPE
  // ==============================

  const isLost =
    post?.postType === "LOST";

  const isFound =
    post?.postType === "FIND" ||
    post?.postType === "FOUND";

  // ==============================
  // POST OWNER
  // ==============================

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  const postOwnerId =
    post?.userId?._id ||
    post?.userId;

  const isOwnPost =
    currentUserId &&
    postOwnerId &&
    String(currentUserId) ===
      String(postOwnerId);

  // ==============================
  // RENDER
  // ==============================

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={getUserImage()}
            alt={
              post?.userId?.name ||
              "User"
            }
            className="h-11 w-11 shrink-0 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  post?.userId
                    ?.name ||
                    "User"
                )}`;
            }}
          />

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-800">
              {post?.userId?.name ||
                "Unknown User"}
            </h3>

            <p className="text-xs text-gray-500">
              {getDate()}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

      {/* ==================================
          DESCRIPTION
      ================================== */}

      {post?.description && (
        <div className="px-4 pb-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {post.description}
          </p>
        </div>
      )}

      {/* ==================================
          IMAGE
      ================================== */}

      {totalImages > 0 && (
        <div className="relative bg-gray-100">
          <img
            src={getImageUrl(
              images[currentImage]
            )}
            alt="Post"
            className="block max-h-[600px] w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display =
                "none";
            }}
          />

          {totalImages > 1 && (
            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              {currentImage + 1}
              {" / "}
              {totalImages}
            </div>
          )}

          {totalImages > 1 && (
            <button
              type="button"
              onClick={
                previousImage
              }
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl text-white transition hover:bg-black/70"
            >
              ‹
            </button>
          )}

          {totalImages > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl text-white transition hover:bg-black/70"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* ==================================
          IMAGE DOTS
      ================================== */}

      {totalImages > 1 && (
        <div className="flex justify-center gap-1.5 py-3">
          {images.map(
            (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setCurrentImage(
                    index
                  )
                }
                className={`h-1.5 rounded-full transition-all ${
                  index ===
                  currentImage
                    ? "w-5 bg-blue-600"
                    : "w-1.5 bg-gray-300"
                }`}
              />
            )
          )}
        </div>
      )}

      {/* ==================================
          STATS
      ================================== */}

      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
        <span>
          {likesCount}{" "}
          {likesCount === 1
            ? "Like"
            : "Likes"}
        </span>

        <button
          type="button"
          onClick={() =>
            setShowComments(
              !showComments
            )
          }
          className="hover:text-blue-600"
        >
          {comments.length}{" "}
          {comments.length === 1
            ? "Comment"
            : "Comments"}
        </button>
      </div>

      {/* ==================================
          ACTION BUTTONS
      ================================== */}

      <div className="mx-4 border-t border-gray-100">
        <div
          className={
            isFound &&
            !isOwnPost
              ? "grid grid-cols-4"
              : "grid grid-cols-3"
          }
        >
          {/* LIKE */}

          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              liked
                ? "text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">
              {liked
                ? <AiFillLike />
                : <AiOutlineLike />}
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
            onClick={() =>
              setShowComments(
                !showComments
              )
            }
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
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
            onClick={handleSave}
            disabled={saveLoading}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              saved
                ? "text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">
              {saved
                ? <GoBookmarkFill />
                : <GoBookmark />}
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
                className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
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

      {/* ==================================
          COMMENTS
      ================================== */}

      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <form
            onSubmit={
              handleComment
            }
            className="mb-4 flex gap-2"
          >
            <img
              src={
                currentUser?.picture
                  ? getImageUrl(
                      currentUser.picture
                    )
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentUser
                        ?.name ||
                        "User"
                    )}`
              }
              alt="You"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />

            <input
              type="text"
              value={commentText}
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={
                commentLoading ||
                !commentText.trim()
              }
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentLoading
                ? "..."
                : "Post"}
            </button>
          </form>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="py-3 text-center text-sm text-gray-500">
                No comments yet.
              </p>
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
                      className="flex gap-2"
                    >
                      <img
                        src={
                          commentUser
                            ?.picture
                            ? getImageUrl(
                                commentUser.picture
                              )
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                commentUser
                                  ?.name ||
                                  "User"
                              )}`
                        }
                        alt={
                          commentUser
                            ?.name ||
                          "User"
                        }
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />

                      <div className="rounded-2xl bg-white px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800">
                          {commentUser?.name ||
                            "User"}
                        </p>

                        <p className="text-sm text-gray-700">
                          {
                            comment?.text
                          }
                        </p>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
