import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import PostCard from "../../components/Post/PostCard";
import { IoBookmarks } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";


const API_URL = "http://localhost:3000";

const SavedPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // FETCH SAVED POSTS
  // ==============================

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("findback_token");

      if (!token) {
        setError("Please login to see saved posts.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/posts/saved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(
        response.data?.data || []
      );
    } catch (error) {
      console.error(
        "Saved posts error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load saved posts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  // ==============================
  // REMOVE FROM SAVED
  // ==============================

  const handleUnsave = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.filter(
        (post) => post._id !== postId
      )
    );
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_220px]">

          {/* LEFT SIDEBAR */}

          <aside className="hidden lg:block">
            <Sidebar />
          </aside>

          {/* MAIN */}

          <main className="min-w-0">

            <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">

              <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />

              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />

            </div>

            <div className="space-y-5">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl bg-white p-5"
                >

                  <div className="flex items-center gap-3">

                    <div className="h-11 w-11 rounded-full bg-gray-200" />

                    <div className="space-y-2">

                      <div className="h-4 w-32 rounded bg-gray-200" />

                      <div className="h-3 w-20 rounded bg-gray-200" />

                    </div>

                  </div>

                  <div className="mt-5 h-64 rounded-lg bg-gray-200" />

                </div>
              ))}

            </div>

          </main>

          {/* RIGHT */}

          <aside className="hidden lg:block">
            <div className="min-h-[200px]" />
          </aside>

        </div>
      </div>
    );
  }

  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_220px]">

        {/* =====================================
            LEFT SIDEBAR
        ===================================== */}

        <aside className="hidden lg:block">
          <Sidebar />
        </aside>


        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <main className="min-w-0">

          {/* HEADER */}

          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between gap-3">

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-2xl">
                    <IoBookmarks />
                  </span>

                  <h1 className="text-2xl font-bold text-gray-800">
                    Saved Posts
                  </h1>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Posts you saved for later.
                </p>

              </div>


              {/* REFRESH */}

              <button
                onClick={fetchSavedPosts}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <IoMdRefresh />
                <p>Refresh</p>
              </button>

            </div>


            {/* COUNT */}

            <div className="mt-4 border-t border-gray-100 pt-3">

              <p className="text-sm text-gray-500">

                {posts.length === 0
                  ? "No saved posts"
                  : `${posts.length} saved ${
                      posts.length === 1
                        ? "post"
                        : "posts"
                    }`}

              </p>

            </div>

          </div>


          {/* =====================================
              ERROR
          ===================================== */}

          {error && (

            <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">

              <div className="text-4xl">
                ⚠️
              </div>

              <h2 className="mt-3 font-semibold text-red-700">
                Something went wrong
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={fetchSavedPosts}
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>

            </div>

          )}


          {/* =====================================
              EMPTY
          ===================================== */}

          {!error &&
            posts.length === 0 && (

              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
                  <IoBookmarks />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-gray-800">
                  No Saved Posts
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  When you save a lost or found
                  product post, it will appear
                  here so you can easily find it
                  later.
                </p>

                <a
                  href="/"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Browse Posts
                </a>

              </div>

            )}


          {/* =====================================
              SAVED POSTS
          ===================================== */}

          {!error &&
            posts.length > 0 && (

              <div className="space-y-5">

                {posts.map((post) => (

                  <PostCard
                    key={post._id}
                    post={post}
                    onUnsave={() =>
                      handleUnsave(
                        post._id
                      )
                    }
                  />

                ))}

              </div>

            )}

        </main>


        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <aside className="hidden lg:block">

          <div className="sticky top-24 rounded-xl border border-dashed border-gray-200 bg-white/50 p-5">

            <p className="text-center text-xs text-gray-400">
              Saved posts
            </p>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default SavedPost;