import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/ChatGPT Image Aug 14, 2026 at 02_45_30 AM.png"
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { BsFillFileEarmarkPostFill } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";

const Navbar = () => {
    const navigate = useNavigate();

    const [showDropdown, setShowDropdown] = useState(false);

    // Get logged-in user
    const storedUser = localStorage.getItem("findback_user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;

    const handleLogout = () => {
        localStorage.removeItem("findback_token");
        localStorage.removeItem("findback_user");

        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 shadow bg-white">
            <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-4">

                {/* LEFT - LOGO */}
                <Link to="/"
                >
                    <img className="w-50 h-30" src={logo} alt="" />
                </Link>

                {/* MIDDLE MENU */}
                <div className="hidden items-center gap-8 md:flex">

                    <Link
                        to="/"
                        className="flex items-center gap-1 text-xl text-gray-700 hover:text-blue-600"
                    >
                        <FaHome />
                        <p>Home</p>
                    </Link>

                    {user && (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center gap-1 text-xl text-gray-700 hover:text-blue-600"
                            >
                                <FaUser />
                                <p>Profile</p>
                            </Link>

                            <Link
                                to="/my-post"
                                className="flex items-center gap-1 text-xl text-gray-700 hover:text-blue-600"
                            >
                                <BsFillFileEarmarkPostFill />
                                <p>My Post</p>
                            </Link>
                        </>
                    )}

                </div>

                {/* RIGHT */}
                <div className="relative flex items-center gap-4">

                    {user ? (
                        <>

                            {/* PROFILE */}
                            <button
                                onClick={() =>
                                    setShowDropdown(!showDropdown)
                                }
                                className="flex items-center gap-2"
                            >

                                <img
                                    src={
                                        user.picture
                                            ? user.picture.startsWith("http")
                                                ? user.picture
                                                : `http://localhost:3000/${user.picture.replace(/^\/+/, "")}`
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                user.name || "User"
                                            )}`
                                    }
                                    alt={user.name || "User"}
                                    className="h-9 w-9 rounded-full object-cover"
                                />

                                <span className="hidden font-medium md:block">
                                    {user.name}
                                </span>

                                <span className="text-sm">
                                    <IoIosArrowDown />
                                </span>

                            </button>

                            {/* DROPDOWN */}
                            {showDropdown && (
                                <div className="absolute right-0 top-12 w-52 rounded-lg border border-blue-500 bg-white py-2 shadow-lg">

                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setShowDropdown(false)
                                        }
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Profile
                                    </Link>

                                    <Link
                                        to="/my-post"
                                        onClick={() =>
                                            setShowDropdown(false)
                                        }
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        My Post
                                    </Link>

                                    {/* ADMIN / RESPONSIBLE PERSON */}
                                    {(user.userType === "ADMIN" ||
                                        user.userType ===
                                        "RESPONSIBLE_PERSON") && (
                                            <Link
                                                to="/user-management"
                                                onClick={() =>
                                                    setShowDropdown(false)
                                                }
                                                className="block px-4 py-2 hover:bg-gray-100"
                                            >
                                                User Management
                                            </Link>
                                        )}

                                    <hr className="my-2 text-blue-500" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>

                                </div>
                            )}

                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>

            </div>
        </nav>
    );
};

export default Navbar;