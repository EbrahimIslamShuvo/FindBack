
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiUpload,
  FiUser,
  FiFileText,
  FiShield,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";

const API_URL = "http://localhost:3000";

const Claim = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  // ==============================
  // AUTH
  // ==============================

  const token =
    localStorage.getItem("findback_token");

  const storedUser =
    localStorage.getItem("findback_user");

  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  // ==============================
  // STATES
  // ==============================

  const [post, setPost] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [claimerImage, setClaimerImage] =
    useState(null);

  const [proofDocument, setProofDocument] =
    useState(null);

  const [claimerPreview, setClaimerPreview] =
    useState("");

  const [proofPreview, setProofPreview] =
    useState("");

  // ==============================
  // AUTH CHECK
  // ==============================

  useEffect(() => {
    if (!token || !currentUser) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [token, currentUser, navigate]);

  // ==============================
  // IMAGE URL
  // ==============================

  const getImageUrl = (image) => {
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
  // GET POST
  // ==============================

  useEffect(() => {
    const fetchPost = async () => {
      if (!token || !postId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await axios.get(
            `${API_URL}/api/posts/${postId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const postData =
          response.data?.data;

        if (!postData) {
          setError(
            "Found post information could not be loaded."
          );
          return;
        }

        // ==============================
        // ONLY FOUND POSTS CAN BE CLAIMED
        // ==============================

        const isFound =
          postData.postType === "FIND" ||
          postData.postType === "FOUND";

        if (!isFound) {
          setError(
            "Only found items can be claimed."
          );
          return;
        }

        // ==============================
        // POST MUST BE ACTIVE
        // ==============================

        if (
          postData.status &&
          postData.status !== "ACTIVE"
        ) {
          setError(
            "This item is no longer available for claiming."
          );
          return;
        }

        // ==============================
        // USER CANNOT CLAIM OWN POST
        // ==============================

        const postOwnerId =
          postData?.userId?._id ||
          postData?.userId;

        const currentUserId =
          currentUser?._id ||
          currentUser?.id;

        if (
          postOwnerId &&
          currentUserId &&
          String(postOwnerId) ===
            String(currentUserId)
        ) {
          setError(
            "You cannot claim your own post."
          );
          return;
        }

        setPost(postData);
      } catch (err) {
        console.error(
          "Fetch post error:",
          err?.response?.data ||
            err
        );

        if (
          err?.response?.status ===
          401
        ) {
          localStorage.removeItem(
            "findback_token"
          );

          localStorage.removeItem(
            "findback_user"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setError(
          err?.response?.data
            ?.message ||
            "Failed to load found post."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [
    postId,
    token,
    currentUser?._id,
    currentUser?.id,
    navigate,
  ]);

  // ==============================
  // FILE VALIDATION
  // ==============================

  const validateImage = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      return false;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be less than 5MB."
      );

      return false;
    }

    return true;
  };

  // ==============================
  // CLAIMER IMAGE
  // ==============================

  const handleClaimerImage = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setClaimerImage(file);

    setClaimerPreview(
      URL.createObjectURL(file)
    );
  };

  // ==============================
  // PROOF DOCUMENT
  // ==============================

  const handleProofDocument = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setProofDocument(file);

    setProofPreview(
      URL.createObjectURL(file)
    );
  };

  // ==============================
  // REMOVE CLAIMER IMAGE
  // ==============================

  const removeClaimerImage = () => {
    setClaimerImage(null);
    setClaimerPreview("");
  };

  // ==============================
  // REMOVE PROOF IMAGE
  // ==============================

  const removeProofDocument = () => {
    setProofDocument(null);
    setProofPreview("");
  };

  // ==============================
  // SUBMIT CLAIM
  // ==============================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // ==============================
    // AUTH CHECK
    // ==============================

    if (!token || !currentUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    // ==============================
    // VALIDATION
    // ==============================

    if (!claimerImage) {
      setError(
        "Please upload your image."
      );

      return;
    }

    if (!proofDocument) {
      setError(
        "Please upload your proof document."
      );

      return;
    }

    if (!postId) {
      setError(
        "Invalid post."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      // ==============================
      // FORM DATA
      // ==============================

      const formData =
        new FormData();

      formData.append(
        "claimerImage",
        claimerImage
      );

      formData.append(
        "proofDocument",
        proofDocument
      );

      // ==============================
      // API REQUEST
      // ==============================

      const response =
        await axios.post(
          `${API_URL}/api/claims/post/${postId}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        response.data;

      if (
        result?.success === false
      ) {
        setError(
          result?.message ||
            "Failed to submit claim."
        );

        return;
      }

      setSuccess(
        "Your claim has been submitted successfully."
      );

      // ==============================
      // REDIRECT AFTER SUCCESS
      // ==============================

      setTimeout(() => {
        navigate("/my-claims");
      }, 1500);
    } catch (err) {
      console.error(
        "Claim submit error:",
        err?.response?.data ||
          err
      );

      // ==============================
      // TOKEN EXPIRED
      // ==============================

      if (
        err?.response?.status ===
        401
      ) {
        localStorage.removeItem(
          "findback_token"
        );

        localStorage.removeItem(
          "findback_user"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err?.response?.data
          ?.message ||
          "Failed to submit claim. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading found item...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error && !post) {
    return (
      <div className="min-h-[80vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FiAlertCircle
                size={30}
              />
            </div>

            <h2 className="mb-2 text-xl font-bold text-slate-800">
              Unable to Claim
            </h2>

            <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">

        {/* ==================================
            BACK BUTTON
        ================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        {/* ==================================
            PAGE HEADER
        ================================== */}

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
            <FiShield />
            Secure Claim Process
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Claim This Found Item
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Provide your image and proof of ownership.
            Your claim will be reviewed by a responsible
            person before the item is returned to you.
          </p>
        </div>

        {/* ==================================
            MAIN GRID
        ================================== */}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">

          {/* ==================================
              FOUND ITEM
          ================================== */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Found Item
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-800">
                    Item Information
                  </h2>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  FOUND
                </span>
              </div>
            </div>

            {/* ITEM IMAGE */}

            {post?.images?.length >
            0 && (
              <div className="bg-slate-100">
                <img
                  src={getImageUrl(
                    post.images[0]
                  )}
                  alt="Found item"
                  className="h-[280px] w-full object-contain sm:h-[340px]"
                />
              </div>
            )}

            {/* ITEM DETAILS */}

            <div className="space-y-5 p-6">

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {post?.description ||
                    "No description available."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-5">

                <div className="flex items-center gap-3">
                  {post?.userId
                    ?.picture ? (
                    <img
                      src={getImageUrl(
                        post.userId
                          .picture
                      )}
                      alt={
                        post.userId
                          ?.name ||
                        "User"
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <FiUser />
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-400">
                      Found by
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {post?.userId
                        ?.name ||
                        "Unknown User"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ==================================
              CLAIM FORM
          ================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

            {/* FORM HEADER */}

            <div className="mb-7">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiShield size={26} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Submit Your Claim
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Upload clear images so the responsible
                person can verify your claim.
              </p>
            </div>

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <FiCheckCircle
                  className="mt-0.5 shrink-0"
                  size={18}
                />

                <p>
                  {success}
                </p>
              </div>
            )}

            {/* ERROR */}

            {error && post && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <FiAlertCircle
                  className="mt-0.5 shrink-0"
                  size={18}
                />

                <p>
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >

              {/* ==================================
                  CLAIMER IMAGE
              ================================== */}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FiUser
                    className="text-blue-600"
                  />

                  <label className="text-sm font-semibold text-slate-800">
                    Your Image
                  </label>

                  <span className="text-xs text-red-500">
                    Required
                  </span>
                </div>

                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Upload a clear image of yourself
                  for identification.
                </p>

                {!claimerPreview ? (
                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40">

                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <FiUpload
                        size={22}
                      />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      Click to upload your image
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      JPG, PNG or WEBP · Max 5MB
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={
                        handleClaimerImage
                      }
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                    <img
                      src={
                        claimerPreview
                      }
                      alt="Your preview"
                      className="h-64 w-full object-contain"
                    />

                    <button
                      type="button"
                      onClick={
                        removeClaimerImage
                      }
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
                    >
                      <FiX />
                    </button>

                    <div className="border-t border-slate-200 bg-white px-4 py-3">
                      <p className="truncate text-xs font-medium text-slate-600">
                        {claimerImage?.name}
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* ==================================
                  PROOF DOCUMENT
              ================================== */}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FiFileText
                    className="text-blue-600"
                  />

                  <label className="text-sm font-semibold text-slate-800">
                    Proof Document
                  </label>

                  <span className="text-xs text-red-500">
                    Required
                  </span>
                </div>

                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Upload an image of a document or
                  evidence that proves the item belongs
                  to you.
                </p>

                {!proofPreview ? (
                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40">

                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <FiFileText
                        size={22}
                      />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      Click to upload proof
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      JPG, PNG or WEBP · Max 5MB
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={
                        handleProofDocument
                      }
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                    <img
                      src={
                        proofPreview
                      }
                      alt="Proof preview"
                      className="h-64 w-full object-contain"
                    />

                    <button
                      type="button"
                      onClick={
                        removeProofDocument
                      }
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
                    >
                      <FiX />
                    </button>

                    <div className="border-t border-slate-200 bg-white px-4 py-3">
                      <p className="truncate text-xs font-medium text-slate-600">
                        {proofDocument?.name}
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* ==================================
                  INFORMATION
              ================================== */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex gap-3">
                  <FiShield
                    className="mt-0.5 shrink-0 text-blue-600"
                    size={18}
                  />

                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Claim verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700/80">
                      Your claim will first be reviewed
                      by a responsible person. If approved,
                      the item will move to the physical
                      verification stage.
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================
                  SUBMIT BUTTON
              ================================== */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  !claimerImage ||
                  !proofDocument
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting Claim...
                  </>
                ) : (
                  <>
                    <FiCheckCircle
                      size={18}
                    />
                    Submit Claim
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                By submitting this claim, you confirm that
                the information and documents provided are
                genuine.
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claim;
