import { useEffect, useState } from "react";
import axios from "axios";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { MdCurtainsClosed } from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";
import { MdGridOn } from "react-icons/md";
import { MdOutlineTableRows } from "react-icons/md";
import { CiViewColumn } from "react-icons/ci";



const API_URL = "http://localhost:3000";

const CreatePost = () => {
    const storedUser = localStorage.getItem("findback_user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;

    const token = localStorage.getItem(
        "findback_token"
    );

    // =========================
    // STATES
    // =========================

    const [postType, setPostType] = useState("FIND");

    const [description, setDescription] =
        useState("");

    const [images, setImages] = useState([]);

    const [layout, setLayout] = useState("grid");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    // =========================
    // PROFILE IMAGE
    // =========================

    const getProfileImage = () => {
        if (!user?.picture) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
            )}`;
        }

        if (user.picture.startsWith("http")) {
            return user.picture;
        }

        return `${API_URL}/${user.picture.replace(
            /^\/+/,
            ""
        )}`;
    };

    // =========================
    // IMAGE SELECT
    // =========================

    const handleImageChange = (e) => {
        const files = Array.from(
            e.target.files || []
        );

        if (files.length === 0) {
            return;
        }

        // Maximum 10 images
        if (images.length + files.length > 10) {
            setError(
                "You can upload maximum 10 images."
            );

            e.target.value = "";

            return;
        }

        // Maximum 5MB
        const invalidFile = files.find(
            (file) =>
                file.size > 5 * 1024 * 1024
        );

        if (invalidFile) {
            setError(
                "Each image must be less than 5MB."
            );

            e.target.value = "";

            return;
        }

        // Only images
        const invalidType = files.find(
            (file) =>
                !file.type.startsWith("image/")
        );

        if (invalidType) {
            setError(
                "Only image files are allowed."
            );

            e.target.value = "";

            return;
        }

        const newImages = files.map(
            (file) => ({
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                preview:
                    URL.createObjectURL(file),
            })
        );

        setImages((previousImages) => [
            ...previousImages,
            ...newImages,
        ]);

        setError("");

        // Same file আবার select করার জন্য
        e.target.value = "";
    };

    // =========================
    // REMOVE IMAGE
    // =========================

    const removeImage = (id) => {
        setImages((previousImages) => {
            const imageToRemove =
                previousImages.find(
                    (image) => image.id === id
                );

            if (imageToRemove?.preview) {
                URL.revokeObjectURL(
                    imageToRemove.preview
                );
            }

            return previousImages.filter(
                (image) => image.id !== id
            );
        });
    };

    // =========================
    // REMOVE ALL
    // =========================

    const removeAllImages = () => {
        images.forEach((image) => {
            if (image.preview) {
                URL.revokeObjectURL(
                    image.preview
                );
            }
        });

        setImages([]);
    };

    // =========================
    // MOVE LEFT
    // =========================

    const moveLeft = (index) => {
        if (index === 0) {
            return;
        }

        setImages((previousImages) => {
            const updated = [
                ...previousImages,
            ];

            [
                updated[index - 1],
                updated[index],
            ] = [
                    updated[index],
                    updated[index - 1],
                ];

            return updated;
        });
    };

    // =========================
    // MOVE RIGHT
    // =========================

    const moveRight = (index) => {
        if (
            index ===
            images.length - 1
        ) {
            return;
        }

        setImages((previousImages) => {
            const updated = [
                ...previousImages,
            ];

            [
                updated[index],
                updated[index + 1],
            ] = [
                    updated[index + 1],
                    updated[index],
                ];

            return updated;
        });
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!token || !user) {
            setError(
                "Please login before creating a post."
            );

            return;
        }

        if (
            !description.trim() &&
            images.length === 0
        ) {
            setError(
                "Please add a description or image."
            );

            return;
        }

        try {
            setLoading(true);

            // =========================
            // FORM DATA
            // =========================

            const formData = new FormData();

            formData.append(
                "postType",
                postType
            );

            formData.append(
                "description",
                description.trim()
            );

            formData.append(
                "layout",
                layout
            );

            // Multiple images
            images.forEach((image) => {
                formData.append(
                    "images",
                    image.file
                );
            });

            // =========================
            // API REQUEST
            // =========================

            const response =
                await axios.post(
                    `${API_URL}/api/posts/create`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            console.log(
                "Create Post Response:",
                response.data
            );

            // =========================
            // SUCCESS
            // =========================

            alert(
                "Post created successfully!"
            );

            // Remove preview URLs
            images.forEach((image) => {
                if (image.preview) {
                    URL.revokeObjectURL(
                        image.preview
                    );
                }
            });

            // Reset
            setPostType("FIND");

            setDescription("");

            setImages([]);

            setLayout("grid");

        } catch (error) {
            console.error(
                "Create post error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                "Failed to create post.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CLEANUP
    // =========================

    useEffect(() => {
        return () => {
            images.forEach((image) => {
                if (image.preview) {
                    URL.revokeObjectURL(
                        image.preview
                    );
                }
            });
        };
    }, []);

    // =========================
    // NOT LOGGED IN
    // =========================

    if (!user) {
        return null;
    }

    return (
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm -z-50">



            <form onSubmit={handleSubmit}>

                <div className="flex justify-between">
                    {/* =========================
                    USER
                    ========================= */}

                    <div className="mb-5 flex items-center gap-3">

                        <img
                            src={getProfileImage()}
                            alt={user.name || "User"}
                            className="h-11 w-11 rounded-full object-cover"
                        />

                        <div>
                            <h3 className="font-semibold text-gray-800">
                                {user.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                                Create a post
                            </p>
                        </div>

                    </div>

                    {/* =========================
                    POST TYPE
                    ========================= */}
                    <div className="mb-5">
                        <div className="grid grid-cols-2 gap-3">
                            {/* FIND */}
                            <button
                                type="button"
                                onClick={() =>
                                    setPostType("FIND")
                                }
                                className={`flex items-center gap-1 rounded-lg border px-4 py-3 font-medium transition ${postType === "FIND"
                                    ? "border-blue-600 bg-blue-50 text-blue-600"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <HiMiniViewfinderCircle className="text-lg -mt-1"/> 
                                <p>I Found Something</p>
                            </button>

                            {/* LOST */}

                            <button
                                type="button"
                                onClick={() =>
                                    setPostType("LOST")
                                }
                                className={`flex items-center gap-1 rounded-lg border px-4 py-3 font-medium transition ${postType === "LOST"
                                    ? "border-red-500 bg-red-50 text-red-500"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <MdCurtainsClosed className="text-lg -mt-1"/> 
                                <p>I Lost Something</p>
                            </button>

                        </div>

                    </div>
                </div>

                {/* =========================
                DESCRIPTION
                ========================= */}

                <textarea
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                    placeholder={
                        postType === "FIND"
                            ? "Describe the product you found..."
                            : "Describe the product you lost..."
                    }
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
                />

                {/* =========================
            ERROR
        ========================= */}

                {error && (
                    <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* =========================
            IMAGE PREVIEW
        ========================= */}

                {images.length > 0 && (
                    <div className="mt-4 rounded-lg border bg-gray-50 p-3">

                        <div className="mb-3 flex items-center justify-between">

                            <div>
                                <p className="font-medium text-gray-700">
                                    {images.length}{" "}
                                    {images.length === 1
                                        ? "Image"
                                        : "Images"}
                                </p>

                                <p className="text-xs text-gray-500">
                                    Maximum 10 images
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    removeAllImages
                                }
                                className="text-sm font-medium text-red-500 hover:text-red-700"
                            >
                                Remove All
                            </button>

                        </div>

                        {/* IMAGE GRID */}

                        <div
                            className={
                                layout === "horizontal"
                                    ? "flex gap-2 overflow-x-auto"
                                    : layout === "vertical"
                                        ? "flex flex-col gap-2"
                                        : "grid grid-cols-2 gap-2"
                            }
                        >

                            {images.map(
                                (image, index) => (

                                    <div
                                        key={image.id}
                                        className={`group relative overflow-hidden rounded-lg bg-gray-200 ${layout ===
                                            "horizontal"
                                            ? "h-40 min-w-[220px]"
                                            : layout ===
                                                "vertical"
                                                ? "h-64"
                                                : "h-48"
                                            }`}
                                    >

                                        <img
                                            src={image.preview}
                                            alt={`Image ${index + 1
                                                }`}
                                            className="h-full w-full object-cover"
                                        />

                                        {/* NUMBER */}

                                        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                                            {index + 1}
                                        </div>

                                        {/* REMOVE */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeImage(
                                                    image.id
                                                )
                                            }
                                            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-sm text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                                        >
                                            ✕
                                        </button>

                                        {/* ORDER */}

                                        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition group-hover:opacity-100">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveLeft(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    index === 0
                                                }
                                                className="rounded bg-black/70 px-3 py-1 text-white disabled:opacity-30"
                                            >
                                                ←
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveRight(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                    images.length -
                                                    1
                                                }
                                                className="rounded bg-black/70 px-3 py-1 text-white disabled:opacity-30"
                                            >
                                                →
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>
                )}

                {/* =========================
            BOTTOM CONTROLS
        ========================= */}

                <div className="mt-4 border-t pt-3">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                        {/* ADD IMAGE */}

                        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-100">

                            <span className="text-xl">
                                <RiImageAddFill />
                            </span>

                            <span className="font-medium">
                                Add Photos
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={
                                    handleImageChange
                                }
                                className="hidden"
                            />

                        </label>

                        {/* LAYOUT */}

                        {images.length > 1 && (
                            <div className="flex flex-wrap items-center gap-2">

                                <span className="text-sm text-gray-500">
                                    Layout:
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setLayout("grid")
                                    }
                                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm ${layout === "grid"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                     <MdGridOn />
                                     <p>Grid</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setLayout(
                                            "horizontal"
                                        )
                                    }
                                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm ${layout ===
                                        "horizontal"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <MdOutlineTableRows /> 
                                    <p>Row</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setLayout("vertical")
                                    }
                                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm ${layout ===
                                        "vertical"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <CiViewColumn /> 
                                    <p>Column</p>
                                </button>

                            </div>
                        )}

                    </div>

                    {/* =========================
              POST BUTTON
          ========================= */}

                    <div className="mt-3 flex justify-end">

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                (!description.trim() &&
                                    images.length === 0)
                            }
                            className="rounded-lg bg-blue-600 px-7 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {loading
                                ? "Posting..."
                                : "Post"}
                        </button>

                    </div>

                </div>

            </form>
        </div>
    );
};

export default CreatePost;