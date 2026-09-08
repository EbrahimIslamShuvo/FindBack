import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import CreatePost from "../../components/Post/CreatePost";
import PostCard from "../../components/Post/PostCard";
import { IoIosRefresh } from "react-icons/io";
import { FaBoxOpen } from "react-icons/fa6";

const API_URL = "http://localhost:3000";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // GET ALL POSTS
    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/posts`
            );

            const allPosts =
                response?.data?.data || [];

            // HIDE RETURNED / REFUNDED POSTS
            const activePosts = allPosts.filter(
                (post) =>
                    post?.status !== "RETURNED"
            );

            setPosts(activePosts);

        } catch (error) {
            console.error(
                "Fetch posts error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Failed to load posts."
            );
        } finally {
            setLoading(false);
        }
    };

    // LOAD POSTS
    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 -z-12">

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[310px_minmax(0,1fr)_220px]">
                {/* LEFT SIDEBAR */}
                <aside className="hidden lg:block">
                    <Sidebar />
                </aside>
                {/* MOBILE SIDEBAR */}
                <div className="lg:hidden">
                    <Sidebar />
                </div>
                {/* MAIN CONTENT */}
                <main className="min-w-0">
                    {/* CREATE POST */}
                    <CreatePost />
                    {/* POST HEADER */}
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                All Posts
                            </h2>
                            <p className="text-sm text-gray-500">
                                Find lost products and help
                                return them to their owners.
                            </p>
                        </div>
                        <button
                            onClick={fetchPosts}
                            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                        >
                            <IoIosRefresh />
                            <p>
                                Refresh
                            </p>
                        </button>
                    </div>
                    {/* LOADING */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse rounded-xl bg-white p-5 shadow-sm"
                                    >
                                        <div className="mb-4 h-10 w-10 rounded-full bg-gray-200" />
                                        <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
                                        <div className="mb-4 h-4 w-full rounded bg-gray-200" />
                                        <div className="h-60 rounded-lg bg-gray-200" />
                                    </div>
                                )
                            )}
                        </div>
                    )}
                    {/* ERROR */}
                    {!loading && error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                            <p className="font-medium text-red-600">
                                {error}
                            </p>
                            <button
                                onClick={fetchPosts}
                                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                    {/* EMPTY */}
                    {!loading &&
                        !error &&
                        posts.length === 0 && (
                            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                                <div className="mb-3 text-5xl">
                                    <FaBoxOpen />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    No posts yet
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Be the first person to
                                    create a lost or found post.
                                </p>
                            </div>
                        )}
                    {/* POSTS */}
                    {!loading &&
                        !error &&
                        posts.length > 0 && (
                            <div className="space-y-5">
                                {posts.map(
                                    (post) => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                        />
                                    )
                                )}
                            </div>
                        )}
                </main>
                {/* RIGHT EMPTY SECTION */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 rounded-xl   p-5">
                        {/* intentionally empty */}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Home;