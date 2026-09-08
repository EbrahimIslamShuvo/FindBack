import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import PostCard from "../../components/Post/PostCard";
import { BsFileEarmarkPostFill } from "react-icons/bs";
import { IoMdRefresh } from "react-icons/io";

const API_URL = "http://localhost:3000";

const MyPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // GET MY POSTS
  // ==============================

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("findback_token");

      if (!token) {
        setError(
          "Please login to see your posts."
        );
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/posts/my-posts`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setPosts(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "My posts error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to get your posts."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);


  // ==============================
  // REMOVE POST
  // ==============================

  const handleDelete = async (
    postId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this post?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const token =
        localStorage.getItem(
          "findback_token"
        );

      await axios.delete(
        `${API_URL}/api/posts/${postId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setPosts((prev) =>
        prev.filter(
          (post) =>
            post._id !== postId
        )
      );

    } catch (error) {

      console.error(
        "Delete post error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Failed to delete post."
      );
    }
  };


  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_220px]">

          <aside className="hidden lg:block">
            <Sidebar />
          </aside>

          <main>

            <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">

              <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />

              <div className="mt-2 h-4 w-60 animate-pulse rounded bg-gray-200" />

            </div>

            <div className="space-y-5">

              {[1, 2].map((item) => (

                <div
                  key={item}
                  className="animate-pulse rounded-xl bg-white p-5"
                >

                  <div className="flex gap-3">

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

          <aside className="hidden lg:block" />

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

        {/* ==================================
            SIDEBAR
        ================================== */}

        <aside className="hidden lg:block">
          <Sidebar />
        </aside>


        {/* ==================================
            MAIN
        ================================== */}

        <main className="min-w-0">

          {/* HEADER */}

          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-2xl">
                    <BsFileEarmarkPostFill />
                  </span>

                  <h1 className="text-2xl font-bold text-gray-800">
                    My Posts
                  </h1>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  All the posts you have created.
                </p>

              </div>


              <button
                onClick={fetchMyPosts}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <IoMdRefresh /> <p>Refresh</p>
              </button>

            </div>


            {/* COUNT */}

            <div className="mt-4 border-t border-gray-100 pt-3">

              <p className="text-sm text-gray-500">

                {posts.length}{" "}
                {posts.length === 1
                  ? "post"
                  : "posts"}

              </p>

            </div>

          </div>


          {/* ==================================
              ERROR
          ================================== */}

          {error && (

            <div className="rounded-xl bg-red-50 p-6 text-center">

              <div className="text-3xl">
                !
              </div>

              <h2 className="mt-2 font-semibold text-red-700">
                Something went wrong
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={fetchMyPosts}
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>

          )}


          {/* ==================================
              EMPTY
          ================================== */}

          {!error &&
            posts.length === 0 && (

              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
                  <BsFileEarmarkPostFill />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-gray-800">
                  No Posts Yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  You haven't created any
                  lost or found product
                  posts yet.
                </p>

                <a
                  href="/create-post"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create Post
                </a>

              </div>

            )}


          {/* ==================================
              POSTS
          ================================== */}

          {!error &&
            posts.length > 0 && (

              <div className="space-y-5">

                {posts.map((post) => (

                  <div
                    key={post._id}
                    className="relative"
                  >

                    <PostCard
                      post={post}
                    />


                    {/* DELETE BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          post._id
                        )
                      }
                      className="absolute right-5 top-16 z-10 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-red-600 shadow-sm ring-1 ring-gray-200 hover:bg-red-50"
                    >
                      Delete
                    </button>

                  </div>

                ))}

              </div>

            )}

        </main>


        {/* ==================================
            RIGHT SIDE
        ================================== */}

        <aside className="hidden lg:block">

          <div className="sticky top-24 rounded-xl border border-dashed border-gray-200 bg-white/50 p-5">

            <p className="text-center text-xs text-gray-400">
              
            </p>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default MyPost;