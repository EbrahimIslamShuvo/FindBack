import { Link, useLocation } from "react-router-dom";

import { MdHomeWork } from "react-icons/md";
import { FaUserCog, FaUsers } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { IoBookmark } from "react-icons/io5";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { MdOutlineRateReview } from "react-icons/md";
import { MdReplay } from "react-icons/md";
import { FiChevronRight } from "react-icons/fi";

const API_URL = "http://localhost:3000";


// =====================================================
// MENU ITEM
// =====================================================

const MenuItem = ({
    item,
    isActive,
}) => {
    const Icon = item.icon;

    const active = isActive(item.path);

    return (
        <Link
            to={item.path}
            className={`
                group relative
                flex items-center gap-3
                rounded-xl
                px-3 py-2.5
                transition-all duration-200

                ${
                    active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
            `}
        >

            {/* ACTIVE INDICATOR */}

            {active && (
                <span
                    className="
                        absolute
                        left-0
                        top-1/2
                        h-6
                        w-1
                        -translate-y-1/2
                        rounded-r-full
                        bg-blue-600
                    "
                />
            )}


            {/* ICON */}

            <div
                className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    transition-all

                    ${
                        active
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                    }
                `}
            >
                <Icon className="text-[18px]" />
            </div>


            {/* NAME */}

            <span
                className={`
                    flex-1
                    text-sm

                    ${
                        active
                            ? "font-semibold"
                            : "font-medium"
                    }
                `}
            >
                {item.name}
            </span>


            {/* ARROW */}

            <FiChevronRight
                className={`
                    text-sm
                    transition-all

                    ${
                        active
                            ? "text-blue-400"
                            : "text-gray-300 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"
                    }
                `}
            />

        </Link>
    );
};


// =====================================================
// SPECIAL MENU ITEM
// =====================================================

const SpecialMenuItem = ({
    to,
    icon: Icon,
    name,
    isActive,
}) => {

    const active = isActive(to);

    return (
        <Link
            to={to}
            className={`
                group relative
                flex items-center gap-3
                rounded-xl
                px-3 py-2.5
                transition-all duration-200

                ${
                    active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
            `}
        >

            {/* ACTIVE INDICATOR */}

            {active && (
                <span
                    className="
                        absolute
                        left-0
                        top-1/2
                        h-6
                        w-1
                        -translate-y-1/2
                        rounded-r-full
                        bg-blue-600
                    "
                />
            )}


            {/* ICON */}

            <div
                className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg

                    ${
                        active
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }
                `}
            >
                <Icon className="text-[18px]" />
            </div>


            {/* NAME */}

            <span
                className={`
                    flex-1
                    text-sm

                    ${
                        active
                            ? "font-semibold"
                            : "font-medium"
                    }
                `}
            >
                {name}
            </span>


            {/* ARROW */}

            <FiChevronRight
                className={`
                    text-sm
                    transition-all

                    ${
                        active
                            ? "text-blue-400"
                            : "text-gray-300 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"
                    }
                `}
            />

        </Link>
    );
};


// =====================================================
// SIDEBAR
// =====================================================

const Sidebar = () => {

    const location = useLocation();


    // =================================================
    // GET LOGGED-IN USER
    // =================================================

    const storedUser =
        localStorage.getItem(
            "findback_user"
        );

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch (error) {

        console.error(
            "Failed to parse stored user:",
            error
        );

        user = null;
    }


    // =================================================
    // USER ROLE
    // =================================================

    const isAdmin =
        user?.userType === "ADMIN";

    const isResponsible =
        user?.userType ===
        "RESPONSIBLE_PERSON";

    const isUser =
        user?.userType === "USER";


    // =================================================
    // ROLE LABEL
    // =================================================

    const getRole = () => {

        if (isAdmin) {
            return "Admin";
        }

        if (isResponsible) {
            return "Responsible";
        }

        return "User";
    };


    // =================================================
    // USER IMAGE
    // =================================================

    const getUserImage = () => {

        if (!user?.picture) {

            return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
            )}&background=eef2ff&color=2563eb`;
        }


        if (
            user.picture.startsWith(
                "http://"
            ) ||
            user.picture.startsWith(
                "https://"
            )
        ) {

            return user.picture;
        }


        return `${API_URL}/${user.picture.replace(
            /^\/+/,
            ""
        )}`;
    };


    // =================================================
    // ACTIVE CHECK
    // =================================================

    const isActive = (path) => {

        return (
            location.pathname === path
        );
    };


    // =================================================
    // MAIN MENU
    // =================================================

    const mainMenu = [
        {
            name: "Home",
            path: "/",
            icon: MdHomeWork,
        },

        {
            name: "Profile",
            path: "/profile",
            icon: FaUserCog,
        },

        {
            name: "My Post",
            path: "/my-post",
            icon: MdPostAdd,
        },

        {
            name: "Saved Posts",
            path: "/saved-posts",
            icon: IoBookmark,
        },
    ];


    return (

        <aside
            className="
                sticky
                top-24
                h-[85vh]
                w-full
                overflow-y-auto
                border-r
                border-gray-100
                bg-white
                rounded-2xl
            "
        >

            <div
                className="
                    flex
                    h-full
                    flex-col
                    px-4
                    py-6
                "
            >

                {/* =================================================
                    PROFILE
                ================================================= */}

                {user && (

                    <div
                        className="
                            mb-7
                            rounded-2xl
                            border
                            border-gray-100
                            bg-gray-50
                            p-3
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            {/* AVATAR */}

                            <div
                                className="
                                    relative
                                    shrink-0
                                "
                            >

                                <img
                                    src={getUserImage()}
                                    alt={
                                        user.name ||
                                        "User"
                                    }
                                    className="
                                        h-11
                                        w-11
                                        rounded-full
                                        border-2
                                        border-white
                                        object-cover
                                        shadow-sm
                                    "
                                    onError={(e) => {

                                        e.currentTarget.src =
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                user.name ||
                                                    "User"
                                            )}&background=eef2ff&color=2563eb`;
                                    }}
                                />


                                {/* ONLINE */}

                                <span
                                    className="
                                        absolute
                                        bottom-0
                                        right-0
                                        h-3
                                        w-3
                                        rounded-full
                                        border-2
                                        border-gray-50
                                        bg-green-500
                                    "
                                />

                            </div>


                            {/* USER INFO */}

                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-bold
                                        text-gray-800
                                    "
                                >
                                    {user.name ||
                                        "User"}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-xs
                                        text-gray-400
                                    "
                                >
                                    {user.email ||
                                        "Welcome back"}
                                </p>

                            </div>

                        </div>


                    </div>

                )}


                {/* =================================================
                    MAIN MENU
                ================================================= */}

                <div>

                    <p
                        className="
                            mb-2
                            px-3
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-widest
                            text-gray-400
                        "
                    >
                        Menu
                    </p>


                    <nav className="space-y-1">

                        {mainMenu.map(
                            (item) => (

                                <MenuItem
                                    key={item.path}
                                    item={item}
                                    isActive={
                                        isActive
                                    }
                                />

                            )
                        )}

                    </nav>

                </div>


                {/* =================================================
                    USER ACTIVITY
                ================================================= */}

                {isUser && (

                    <div className="mt-7">

                        <p
                            className="
                                mb-2
                                px-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-widest
                                text-gray-400
                            "
                        >
                            Activity
                        </p>


                        <SpecialMenuItem
                            to="/my-claims"
                            icon={
                                MdOutlineAssignmentTurnedIn
                            }
                            name="My Claim"
                            isActive={
                                isActive
                            }
                        />

                    </div>

                )}


                {/* =================================================
                    MANAGEMENT
                ================================================= */}

                {(isAdmin ||
                    isResponsible) && (

                    <div className="mt-7">

                        <p
                            className="
                                mb-2
                                px-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-widest
                                text-gray-400
                            "
                        >
                            Management
                        </p>


                        <nav className="space-y-1">

                            {/* CLAIM REQUEST */}

                            <SpecialMenuItem
                                to="/claim-request"
                                icon={
                                    MdOutlineRateReview
                                }
                                name="Claim Request"
                                isActive={
                                    isActive
                                }
                            />


                            {/* REFOUNDED */}

                            <SpecialMenuItem
                                to="/refounded"
                                icon={MdReplay}
                                name="Refounded"
                                isActive={
                                    isActive
                                }
                            />


                            {/* USER MANAGEMENT */}

                            <SpecialMenuItem
                                to="/user-management"
                                icon={FaUsers}
                                name="User Management"
                                isActive={
                                    isActive
                                }
                            />

                        </nav>

                    </div>

                )}


                {/* =================================================
                    BOTTOM MESSAGE
                ================================================= */}

                <div
                    className="
                        mt-auto
                        pt-8
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            bg-gradient-to-br
                            from-blue-50
                            to-indigo-50
                            p-4
                        "
                    >

                        <div
                            className="
                                flex
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                    shadow-sm
                                "
                            >
                                🤝
                            </div>


                            <div>

                                <p
                                    className="
                                        text-xs
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Make a difference
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-[11px]
                                        leading-relaxed
                                        text-gray-500
                                    "
                                >
                                    Help someone find
                                    what they lost.
                                </p>

                            </div>

                        </div>

                    </div>


                    <p
                        className="
                            mt-4
                            text-center
                            text-[10px]
                            text-gray-300
                        "
                    >
                        FindBack
                    </p>

                </div>

            </div>

        </aside>
    );
};

export default Sidebar;