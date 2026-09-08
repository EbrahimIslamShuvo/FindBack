import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/users";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [adding, setAdding] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institutionId: "",
        password: "",
    });

    // ==========================================
    // GET LOGGED IN USER
    // ==========================================

    const storedUser =
        localStorage.getItem("findback_user");

    const currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;

    // ==========================================
    // TOKEN
    // ==========================================

    const getToken = () => {
        return localStorage.getItem(
            "findback_token"
        );
    };

    // ==========================================
    // AXIOS CONFIG
    // ==========================================

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    // ==========================================
    // LOAD USERS
    // ==========================================

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/management`,
                    getConfig()
                );

            setUsers(
                response.data.data || []
            );

        } catch (error) {
            console.error(
                "User management error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load users"
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadUsers();
    }, []);

    // ==========================================
    // VERIFY USER
    // ==========================================

    const handleVerify = async (id) => {
        try {
            await axios.patch(
                `${API_URL}/${id}/verify`,
                {},
                getConfig()
            );

            await loadUsers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to verify user"
            );
        }
    };

    // ==========================================
    // BLOCK USER
    // ==========================================

    const handleBlock = async (id) => {
        const confirmBlock =
            window.confirm(
                "Are you sure you want to block this user?"
            );

        if (!confirmBlock) return;

        try {
            await axios.patch(
                `${API_URL}/${id}/block`,
                {},
                getConfig()
            );

            await loadUsers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to block user"
            );
        }
    };

    // ==========================================
    // UNBLOCK USER
    // ==========================================

    const handleUnblock = async (id) => {
        try {
            await axios.patch(
                `${API_URL}/${id}/unblock`,
                {},
                getConfig()
            );

            await loadUsers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to unblock user"
            );
        }
    };

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ==========================================
    // ADD RESPONSIBLE PERSON
    // ==========================================

    const handleAddResponsiblePerson =
        async (e) => {
            e.preventDefault();

            try {
                setAdding(true);

                await axios.post(
                    `${API_URL}/responsible-person`,
                    formData,
                    getConfig()
                );

                alert(
                    "Responsible Person created successfully"
                );

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    institutionId: "",
                    password: "",
                });

                setShowAddModal(false);

                await loadUsers();

            } catch (error) {
                alert(
                    error.response?.data?.message ||
                    "Failed to create Responsible Person"
                );
            } finally {
                setAdding(false);
            }
        };

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredUsers =
        users.filter((user) => {

            const value =
                search.toLowerCase();

            return (
                user.name
                    ?.toLowerCase()
                    .includes(value) ||

                user.email
                    ?.toLowerCase()
                    .includes(value) ||

                user.phone
                    ?.toLowerCase()
                    .includes(value) ||

                user.institutionId
                    ?.toLowerCase()
                    .includes(value) ||

                user.userType
                    ?.toLowerCase()
                    .includes(value) ||

                user.accountStatus
                    ?.toLowerCase()
                    .includes(value)
            );
        });

    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusClass = (status) => {

        switch (status) {

            case "ACTIVE":
                return "bg-green-100 text-green-700";

            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "BLOCKED":
                return "bg-red-100 text-red-700";

            case "REJECTED":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ==========================================
    // USER TYPE STYLE
    // ==========================================

    const getUserTypeClass = (type) => {

        switch (type) {

            case "ADMIN":
                return "bg-purple-100 text-purple-700";

            case "RESPONSIBLE_PERSON":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-lg font-medium text-gray-600">
                    Loading users...
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="min-h-screen w-8/12 mx-auto bg-gray-50 p-4 md:p-6">

            {/* ====================================== */}
            {/* HEADER */}
            {/* ====================================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        User Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage FindBack users and account verification.
                    </p>
                </div>

                {/* ADMIN ONLY */}

                {currentUser?.userType === "ADMIN" && (
                    <button
                        onClick={() =>
                            setShowAddModal(true)
                        }
                        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
                    >
                        + Add Responsible Person
                    </button>
                )}

            </div>


            {/* ====================================== */}
            {/* ERROR */}
            {/* ====================================== */}

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}


            {/* ====================================== */}
            {/* SEARCH */}
            {/* ====================================== */}

            <div className="mb-5 rounded-xl border bg-white p-4 shadow-sm">

                <input
                    type="text"
                    placeholder="Search by name, email, phone, institution ID..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

            </div>


            {/* ====================================== */}
            {/* USER COUNT */}
            {/* ====================================== */}

            <div className="mb-4 text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                    {filteredUsers.length}
                </span>{" "}
                users
            </div>


            {/* ====================================== */}
            {/* TABLE */}
            {/* ====================================== */}

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1000px]">

                        <thead className="border-b bg-gray-50">

                            <tr>

                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                    User
                                </th>

                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                    Contact
                                </th>

                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                    Institution ID
                                </th>

                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                    Type
                                </th>

                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y">

                            {filteredUsers.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        No users found.
                                    </td>

                                </tr>

                            ) : (

                                filteredUsers.map(
                                    (user) => (

                                        <tr
                                            key={user._id}
                                            className="transition hover:bg-gray-50"
                                        >

                                            {/* USER */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <img
                                                        src={
                                                            user.picture
                                                                ? user.picture.startsWith("http")
                                                                    ? user.picture
                                                                    : `http://localhost:3000/${user.picture.replace(/^\/+/, "")}`
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                    user.name || "User"
                                                                )}&background=e5e7eb&color=374151`
                                                        }
                                                        alt={user.name || "User"}
                                                        className="h-11 w-11 rounded-full object-cover border border-gray-200"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                    user.name || "User"
                                                                )}&background=e5e7eb&color=374151`;
                                                        }}
                                                    />

                                                    <div>

                                                        <p className="font-semibold text-gray-800">
                                                            {user.name}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {user.email}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* CONTACT */}

                                            <td className="px-5 py-4">

                                                <p className="text-sm text-gray-700">
                                                    {user.phone}
                                                </p>

                                            </td>


                                            {/* INSTITUTION */}

                                            <td className="px-5 py-4">

                                                <span className="text-sm font-medium text-gray-700">
                                                    {user.institutionId}
                                                </span>

                                            </td>


                                            {/* TYPE */}

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getUserTypeClass(
                                                        user.userType
                                                    )}`}
                                                >
                                                    {user.userType ===
                                                        "RESPONSIBLE_PERSON"
                                                        ? "Responsible Person"
                                                        : user.userType}
                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        user.accountStatus
                                                    )}`}
                                                >
                                                    {user.accountStatus}
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    {/* PENDING */}

                                                    {user.accountStatus ===
                                                        "PENDING" && (

                                                            <button
                                                                onClick={() =>
                                                                    handleVerify(
                                                                        user._id
                                                                    )
                                                                }
                                                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                                                            >
                                                                Verify
                                                            </button>

                                                        )}


                                                    {/* ACTIVE */}

                                                    {user.accountStatus ===
                                                        "ACTIVE" &&
                                                        user.userType !==
                                                        "ADMIN" && (

                                                            <button
                                                                onClick={() =>
                                                                    handleBlock(
                                                                        user._id
                                                                    )
                                                                }
                                                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                                                            >
                                                                Block
                                                            </button>

                                                        )}


                                                    {/* BLOCKED */}

                                                    {user.accountStatus ===
                                                        "BLOCKED" &&
                                                        currentUser?.userType ===
                                                        "ADMIN" && (

                                                            <button
                                                                onClick={() =>
                                                                    handleUnblock(
                                                                        user._id
                                                                    )
                                                                }
                                                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                                                            >
                                                                Unblock
                                                            </button>

                                                        )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ====================================== */}
            {/* ADD RESPONSIBLE PERSON MODAL */}
            {/* ====================================== */}

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

                        {/* HEADER */}

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">
                                    Add Responsible Person
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create a new responsible person account.
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setShowAddModal(false)
                                }
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleAddResponsiblePerson
                            }
                            className="space-y-4"
                        >

                            {/* NAME */}

                            <div>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter name"
                                    className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter email"
                                    className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
                                />

                            </div>


                            {/* PHONE */}

                            <div>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Phone
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter phone number"
                                    className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
                                />

                            </div>


                            {/* INSTITUTION ID */}

                            <div>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Institution ID
                                </label>

                                <input
                                    type="text"
                                    name="institutionId"
                                    value={
                                        formData.institutionId
                                    }
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter institution ID"
                                    className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
                                />

                            </div>


                            {/* PASSWORD */}

                            <div>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Enter password"
                                    className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddModal(false)
                                    }
                                    className="rounded-lg border px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {adding
                                        ? "Creating..."
                                        : "Create Account"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default UserManagement;