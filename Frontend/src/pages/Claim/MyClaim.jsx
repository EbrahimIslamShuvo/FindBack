
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiShield,
  FiPackage,
  FiFileText,
  FiUser,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";

const API_URL = "http://localhost:3000";

const MyClaim = () => {
  const navigate = useNavigate();

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

  const [claims, setClaims] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
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
  }, [
    token,
    currentUser,
    navigate,
  ]);

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
  // FETCH MY CLAIMS
  // ==============================

  useEffect(() => {
    const fetchMyClaims = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await axios.get(
            `${API_URL}/api/claims/my`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          response.data;

        const claimData =
          result?.data || [];

        setClaims(
          Array.isArray(claimData)
            ? claimData
            : []
        );
      } catch (err) {
        console.error(
          "My claims error:",
          err?.response?.data ||
            err
        );

        // ==============================
        // TOKEN INVALID / EXPIRED
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
            "Failed to load your claims."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyClaims();
  }, [
    token,
    navigate,
  ]);

  // ==============================
  // STATUS CONFIG
  // ==============================

  const getStatusConfig = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending Review",
          icon: <FiClock />,
          className:
            "bg-amber-50 text-amber-600 border-amber-200",
        };

      case "INITIAL_APPROVED":
        return {
          label: "Initially Approved",
          icon: <FiCheckCircle />,
          className:
            "bg-blue-50 text-blue-600 border-blue-200",
        };

      case "INITIAL_REJECTED":
        return {
          label: "Rejected",
          icon: <FiXCircle />,
          className:
            "bg-red-50 text-red-600 border-red-200",
        };

      case "PHYSICAL_VERIFICATION":
        return {
          label: "Physical Verification",
          icon: <FiShield />,
          className:
            "bg-purple-50 text-purple-600 border-purple-200",
        };

      case "COMPLETED":
        return {
          label: "Completed",
          icon: <FiCheckCircle />,
          className:
            "bg-green-50 text-green-600 border-green-200",
        };

      case "REJECTED":
        return {
          label: "Rejected",
          icon: <FiXCircle />,
          className:
            "bg-red-50 text-red-600 border-red-200",
        };

      default:
        return {
          label: status || "Unknown",
          icon: <FiClock />,
          className:
            "bg-slate-50 text-slate-600 border-slate-200",
        };
    }
  };

  // ==============================
  // DATE FORMAT
  // ==============================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        date
      ).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  // ==============================
  // CLAIM POST DATA
  // ==============================

  const getPost = (claim) => {
    return (
      claim?.postId ||
      claim?.post ||
      null
    );
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading your claims...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">

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

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FiAlertCircle
                size={30}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Unable to Load Claims
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
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
      <div className="mx-auto max-w-6xl">
        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              <FiPackage />
              Claim Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              My Claims
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Track the status of items you have
              submitted claims for.
            </p>
          </div>

          {/* CLAIM COUNT */}

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiFileText
                size={20}
              />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Total Claims
              </p>

              <p className="text-lg font-bold text-slate-800">
                {claims.length}
              </p>
            </div>
          </div>

        </div>

        {/* ==================================
            EMPTY STATE
        ================================== */}

        {claims.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-xl shadow-slate-200/40">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <FiPackage
                size={36}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              No Claims Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't submitted any claims yet.
              When you claim a found item, it will
              appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Find an Item
            </button>

          </div>
        ) : (

          /* ==================================
             CLAIM LIST
          ================================== */

          <div className="space-y-5">

            {claims.map(
              (claim, index) => {
                const post =
                  getPost(
                    claim
                  );

                const status =
                  getStatusConfig(
                    claim?.status
                  );

                const postImages =
                  post?.images ||
                  [];

                const firstImage =
                  postImages.length >
                  0
                    ? getImageUrl(
                        postImages[0]
                      )
                    : "";

                return (
                  <div
                    key={
                      claim?._id ||
                      index
                    }
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40"
                  >

                    {/* ==================================
                        CLAIM HEADER
                    ================================== */}

                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FiPackage
                            size={22}
                          />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Claim submitted
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(
                              claim?.createdAt
                            )}
                          </p>
                        </div>

                      </div>

                      {/* STATUS */}

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.icon}

                        {status.label}
                      </div>

                    </div>

                    {/* ==================================
                        CLAIM CONTENT
                    ================================== */}

                    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[260px_1fr]">

                      {/* ==================================
                          ITEM IMAGE
                      ================================== */}

                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                        {firstImage ? (
                          <img
                            src={
                              firstImage
                            }
                            alt="Claimed item"
                            className="h-64 w-full object-contain lg:h-full"
                          />
                        ) : (
                          <div className="flex h-64 items-center justify-center text-slate-400 lg:h-full">
                            <FiPackage
                              size={40}
                            />
                          </div>
                        )}

                      </div>

                      {/* ==================================
                          DETAILS
                      ================================== */}

                      <div className="min-w-0">

                        {/* ITEM */}

                        <div className="mb-5">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Found Item
                          </p>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {post?.description ||
                              "No description available."}
                          </p>
                        </div>

                        {/* FOUND BY */}

                        <div className="mb-5 flex items-center gap-3">

                          {post?.userId
                            ?.picture ? (
                            <img
                              src={getImageUrl(
                                post
                                  .userId
                                  .picture
                              )}
                              alt={
                                post
                                  .userId
                                  ?.name ||
                                "User"
                              }
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
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

                        {/* ==================================
                            STATUS MESSAGE
                        ================================== */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                          <div className="flex gap-3">

                            <div className="mt-0.5 text-blue-600">
                              {status.icon}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {status.label}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {claim?.status ===
                                  "PENDING" &&
                                  "Your claim is waiting for initial review by a responsible person."}

                                {claim?.status ===
                                  "INITIAL_APPROVED" &&
                                  "Your claim has passed the initial review. Physical verification is the next step."}

                                {claim?.status ===
                                  "INITIAL_REJECTED" &&
                                  (claim?.rejectionReason ||
                                    "Your claim was rejected during the initial review.")}

                                {claim?.status ===
                                  "PHYSICAL_VERIFICATION" &&
                                  "The responsible person is physically verifying the item and your claim."}

                                {claim?.status ===
                                  "COMPLETED" &&
                                  "Your claim has been completed and the item has been returned to you."}

                                {claim?.status ===
                                  "REJECTED" &&
                                  (claim?.rejectionReason ||
                                    "Your claim has been rejected.")}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* ==================================
                            CLAIM DOCUMENTS
                        ================================== */}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">

                          {/* CLAIMER IMAGE */}

                          <div className="rounded-2xl border border-slate-200 p-3">

                            <div className="mb-2 flex items-center gap-2">
                              <FiUser
                                className="text-blue-600"
                              />

                              <p className="text-xs font-semibold text-slate-700">
                                Your Image
                              </p>
                            </div>

                            {claim?.claimerImage ? (
                              <img
                                src={getImageUrl(
                                  claim.claimerImage
                                )}
                                alt="Your submitted image"
                                className="h-28 w-full rounded-xl bg-slate-100 object-contain"
                              />
                            ) : (
                              <div className="flex h-28 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">
                                Not available
                              </div>
                            )}

                          </div>

                          {/* PROOF */}

                          <div className="rounded-2xl border border-slate-200 p-3">

                            <div className="mb-2 flex items-center gap-2">
                              <FiFileText
                                className="text-blue-600"
                              />

                              <p className="text-xs font-semibold text-slate-700">
                                Proof Document
                              </p>
                            </div>

                            {claim?.proofDocument ? (
                              <img
                                src={getImageUrl(
                                  claim.proofDocument
                                )}
                                alt="Proof document"
                                className="h-28 w-full rounded-xl bg-slate-100 object-contain"
                              />
                            ) : (
                              <div className="flex h-28 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">
                                Not available
                              </div>
                            )}

                          </div>

                        </div>
                      </div>
                    </div>

                    {/* ==================================
                        COMPLETED
                    ================================== */}

                    {claim?.status ===
                      "COMPLETED" && (
                      <div className="border-t border-green-100 bg-green-50 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <FiCheckCircle
                            className="shrink-0 text-green-600"
                            size={20}
                          />

                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              Claim Completed
                            </p>

                            <p className="mt-0.5 text-xs text-green-700">
                              Completed on{" "}
                              {formatDate(
                                claim?.completedAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default MyClaim;
