import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaCheckCircle,
    FaBoxOpen,
    FaFileAlt,
    FaUserShield,
    FaCalendarAlt,
    FaSearch,
    FaFilter,
    FaTimes,
    FaArrowDown,
    FaArrowUp,
    FaEye,
    FaPhone,
    FaUniversity,
    FaIdCard,
    FaExternalLinkAlt,
    FaInfoCircle,
    FaClipboardCheck,
} from "react-icons/fa";

import axios from "axios";



// ==========================================
// API URL
// ==========================================

const API_URL = "http://localhost:3000";



// ==========================================
// REFUND PAGE
//
// ADMIN
// RESPONSIBLE_PERSON
//
// শুধু COMPLETED claims দেখাবে
// ==========================================

const Refund = () => {

    // ========================================
    // MAIN STATES
    // ========================================

    const [claims, setClaims] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [userRole, setUserRole] = useState("");



    // ========================================
    // SEARCH / FILTER STATES
    // ========================================

    const [searchTerm, setSearchTerm] = useState("");

    const [dateFilter, setDateFilter] = useState("ALL");

    const [sortOrder, setSortOrder] = useState("NEWEST");



    // ========================================
    // DETAILS MODAL
    // ========================================

    const [selectedClaim, setSelectedClaim] =
        useState(null);



    // ========================================
    // FILE PREVIEW MODAL
    // ========================================

    const [previewFile, setPreviewFile] =
        useState(null);



    // ========================================
    // GET USER ROLE FROM JWT
    // ========================================

    const getUserRoleFromToken = (token) => {

        try {

            const payload =
                token.split(".")[1];



            if (!payload) {
                return null;
            }



            const decoded =
                JSON.parse(
                    atob(
                        payload
                            .replace(/-/g, "+")
                            .replace(/_/g, "/")
                    )
                );



            return decoded?.userType || null;

        } catch (error) {

            console.error(
                "Failed to decode token:",
                error
            );



            return null;

        }

    };



    // ========================================
    // FILE URL HELPER
    // ========================================

    const getFileUrl = (file) => {

        if (!file) {
            return null;
        }

        // Backend may return a file string or a file object.
        if (typeof file === "object") {
            file =
                file?.url ||
                file?.path ||
                file?.filename ||
                file?.file ||
                file?.secure_url ||
                file?.location ||
                null;
        }

        if (typeof file !== "string") {
            return null;
        }

        file = file.trim();

        if (!file) {
            return null;
        }



        // ------------------------------------
        // Full URL
        // ------------------------------------

        if (
            file.startsWith("http://") ||
            file.startsWith("https://")
        ) {

            return file;

        }



        // ------------------------------------
        // /uploads/...
        // ------------------------------------

        if (
            file.startsWith("/uploads/")
        ) {

            return `${API_URL}${file}`;

        }



        // ------------------------------------
        // uploads/...
        // ------------------------------------

        if (
            file.startsWith("uploads/")
        ) {

            return `${API_URL}/${file}`;

        }



        // ------------------------------------
        // filename only
        // ------------------------------------

        return `${API_URL}/uploads/${file}`;

    };



    // ========================================
    // OPEN FILE
    // ========================================

    const openFile = (file) => {

        const url =
            getFileUrl(file);



        if (!url) {
            return;
        }



        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    };



    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }



        const parsedDate =
            new Date(date);



        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

        }



        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };



    // ========================================
    // FORMAT DATE + TIME
    // ========================================

    const formatDateTime = (date) => {

        if (!date) {
            return "N/A";
        }



        const parsedDate =
            new Date(date);



        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

        }



        return parsedDate.toLocaleString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };



    // ========================================
    // FETCH REFUNDED CLAIMS
    // ========================================

    const fetchRefundedClaims =
        async () => {

            try {

                setLoading(true);

                setError("");



                // ==================================
                // TOKEN
                // ==================================

                const token =
                    localStorage.getItem(
                        "findback_token"
                    );



                // ==================================
                // TOKEN NOT FOUND
                // ==================================

                if (!token) {

                    window.location.href =
                        "/login";

                    return;

                }



                // ==================================
                // GET ROLE
                // ==================================

                const role =
                    getUserRoleFromToken(
                        token
                    );



                // ==================================
                // INVALID TOKEN
                // ==================================

                if (!role) {

                    localStorage.removeItem(
                        "findback_token"
                    );

                    window.location.href =
                        "/login";

                    return;

                }



                setUserRole(role);



                // ==================================
                // ONLY ADMIN / RESPONSIBLE PERSON
                // ==================================

                if (
                    role !== "ADMIN" &&
                    role !== "RESPONSIBLE_PERSON"
                ) {

                    window.location.href =
                        "/";

                    return;

                }



                // ==================================
                // ENDPOINT
                // ==================================

                let endpoint;



                if (
                    role === "ADMIN"
                ) {

                    endpoint =
                        `${API_URL}/api/claims/admin/all`;

                } else {

                    endpoint =
                        `${API_URL}/api/claims/responsible/pending`;

                }



                // ==================================
                // REQUEST
                // ==================================

                const response =
                    await axios.get(
                        endpoint,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );



                // ==================================
                // DATA
                // ==================================

                const data =
                    response?.data?.data || [];



                // ==================================
                // ONLY COMPLETED
                // ==================================

                const completedClaims =
                    data.filter(
                        (claim) =>
                            claim?.status ===
                            "COMPLETED"
                    );



                // ==================================
                // DEFAULT SORT
                // ==================================

                completedClaims.sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a?.completedAt ||
                                a?.updatedAt ||
                                a?.createdAt ||
                                0
                            );



                        const dateB =
                            new Date(
                                b?.completedAt ||
                                b?.updatedAt ||
                                b?.createdAt ||
                                0
                            );



                        return dateB - dateA;

                    }
                );



                setClaims(
                    completedClaims
                );

            } catch (err) {

                console.error(
                    "Failed to fetch refunded claims:",
                    err
                );



                // ==================================
                // UNAUTHORIZED
                // ==================================

                if (
                    err?.response?.status ===
                    401
                ) {

                    localStorage.removeItem(
                        "findback_token"
                    );

                    window.location.href =
                        "/login";

                    return;

                }



                // ==================================
                // FORBIDDEN
                // ==================================

                if (
                    err?.response?.status ===
                    403
                ) {

                    window.location.href =
                        "/";

                    return;

                }



                setError(
                    err?.response?.data?.message ||
                    "Failed to load refund history."
                );

            } finally {

                setLoading(false);

            }

        };



    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        fetchRefundedClaims();

    }, []);



    // ========================================
    // SEARCH + FILTER + SORT
    // ========================================

    const filteredClaims =
        useMemo(() => {

            let result =
                [...claims];



            // ==================================
            // SEARCH
            // ==================================

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();



            if (search) {

                result =
                    result.filter(
                        (claim) => {

                            const description =
                                claim
                                    ?.postId
                                    ?.description
                                    ?.toLowerCase() ||
                                "";



                            const claimerName =
                                claim
                                    ?.claimerId
                                    ?.name
                                    ?.toLowerCase() ||
                                "";



                            const claimerEmail =
                                claim
                                    ?.claimerId
                                    ?.email
                                    ?.toLowerCase() ||
                                "";



                            const institutionId =
                                claim
                                    ?.claimerId
                                    ?.institutionId
                                    ?.toLowerCase() ||
                                "";



                            const responsibleName =
                                claim
                                    ?.responsiblePersonId
                                    ?.name
                                    ?.toLowerCase() ||
                                "";



                            return (
                                description.includes(
                                    search
                                ) ||
                                claimerName.includes(
                                    search
                                ) ||
                                claimerEmail.includes(
                                    search
                                ) ||
                                institutionId.includes(
                                    search
                                ) ||
                                responsibleName.includes(
                                    search
                                )
                            );

                        }
                    );

            }



            // ==================================
            // DATE FILTER
            // ==================================

            if (
                dateFilter !== "ALL"
            ) {

                const now =
                    new Date();



                result =
                    result.filter(
                        (claim) => {

                            const date =
                                new Date(
                                    claim?.completedAt ||
                                    claim?.updatedAt ||
                                    claim?.createdAt
                                );



                            if (
                                Number.isNaN(
                                    date.getTime()
                                )
                            ) {

                                return false;

                            }



                            // --------------------
                            // LAST 7 DAYS
                            // --------------------

                            if (
                                dateFilter ===
                                "7_DAYS"
                            ) {

                                const limit =
                                    new Date(
                                        now
                                    );



                                limit.setDate(
                                    now.getDate() -
                                    7
                                );



                                return (
                                    date >=
                                    limit
                                );

                            }



                            // --------------------
                            // LAST 30 DAYS
                            // --------------------

                            if (
                                dateFilter ===
                                "30_DAYS"
                            ) {

                                const limit =
                                    new Date(
                                        now
                                    );



                                limit.setDate(
                                    now.getDate() -
                                    30
                                );



                                return (
                                    date >=
                                    limit
                                );

                            }



                            // --------------------
                            // THIS YEAR
                            // --------------------

                            if (
                                dateFilter ===
                                "THIS_YEAR"
                            ) {

                                return (
                                    date.getFullYear() ===
                                    now.getFullYear()
                                );

                            }



                            return true;

                        }
                    );

            }



            // ==================================
            // SORT
            // ==================================

            result.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a?.completedAt ||
                            a?.updatedAt ||
                            a?.createdAt ||
                            0
                        );



                    const dateB =
                        new Date(
                            b?.completedAt ||
                            b?.updatedAt ||
                            b?.createdAt ||
                            0
                        );



                    if (
                        sortOrder ===
                        "OLDEST"
                    ) {

                        return dateA - dateB;

                    }



                    return dateB - dateA;

                }
            );



            return result;

        }, [
            claims,
            searchTerm,
            dateFilter,
            sortOrder,
        ]);



    // ========================================
    // CLEAR FILTERS
    // ========================================

    const clearFilters = () => {

        setSearchTerm("");

        setDateFilter("ALL");

        setSortOrder("NEWEST");

    };



    // ========================================
    // CLOSE DETAILS MODAL
    // ========================================

    const closeDetailsModal = () => {

        setSelectedClaim(null);

        setPreviewFile(null);

    };



    // ========================================
    // LOADING SCREEN
    // ========================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-gray-50
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-4
                    "
                >

                    <div
                        className="
                            w-12
                            h-12
                            border-4
                            border-gray-200
                            border-t-green-600
                            rounded-full
                            animate-spin
                        "
                    />



                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Loading refund history...
                    </p>

                </div>

            </div>

        );

    }



    // ========================================
    // MAIN UI
    // ========================================

    return (

        <div
            className="
                min-h-screen
                bg-gray-50
                px-4
                py-8
                sm:px-6
                lg:px-8
            "
        >

            <div
                className="
                    max-w-7xl
                    mx-auto
                "
            >

                {/* ==================================
                    HEADER
                ================================== */}

                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        gap-5
                        mb-8
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-2xl
                                bg-green-100
                                text-green-600
                                flex
                                items-center
                                justify-center
                                text-xl
                            "
                        >

                            <FaCheckCircle />

                        </div>



                        <div>

                            <h1
                                className="
                                    text-3xl
                                    sm:text-4xl
                                    font-bold
                                    text-gray-900
                                "
                            >
                                Refund History
                            </h1>



                            <p
                                className="
                                    mt-1
                                    text-gray-500
                                "
                            >
                                Successfully completed
                                and returned claims.
                            </p>

                        </div>

                    </div>



                    {/* ROLE */}

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            self-start
                            px-4
                            py-2.5
                            rounded-full
                            bg-white
                            border
                            border-gray-200
                            shadow-sm
                            text-sm
                            font-semibold
                            text-gray-700
                        "
                    >

                        <FaUserShield
                            className="
                                text-green-600
                            "
                        />

                        {userRole === "ADMIN"
                            ? "Admin"
                            : "Responsible Person"}

                    </div>

                </div>



                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-5
                            py-4
                            text-red-700
                        "
                    >

                        {error}

                    </div>

                )}



                {/* ==================================
                    STATISTICS
                ================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-3
                        gap-4
                        mb-6
                    "
                >

                    {/* TOTAL */}

                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    Total Refunds
                                </p>



                                <p
                                    className="
                                        mt-1
                                        text-2xl
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {claims.length}
                                </p>

                            </div>



                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-green-100
                                    text-green-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <FaCheckCircle />

                            </div>

                        </div>

                    </div>



                    {/* SHOWING */}

                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    Showing
                                </p>



                                <p
                                    className="
                                        mt-1
                                        text-2xl
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {
                                        filteredClaims.length
                                    }
                                </p>

                            </div>



                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <FaFileAlt />

                            </div>

                        </div>

                    </div>



                    {/* STATUS */}

                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    Current Status
                                </p>



                                <p
                                    className="
                                        mt-1
                                        text-lg
                                        font-bold
                                        text-green-600
                                    "
                                >
                                    All Returned
                                </p>

                            </div>



                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-green-100
                                    text-green-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <FaBoxOpen />

                            </div>

                        </div>

                    </div>

                </div>



                {/* ==================================
                    SEARCH + FILTER
                ================================== */}

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-2xl
                        p-4
                        shadow-sm
                        mb-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            gap-3
                        "
                    >

                        {/* SEARCH */}

                        <div
                            className="
                                relative
                                flex-1
                            "
                        >

                            <FaSearch
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />



                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="
                                    Search item, claimer,
                                    email, institution or verifier...
                                "
                                className="
                                    w-full
                                    h-12
                                    pl-11
                                    pr-10
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    focus:bg-white
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                    transition
                                "
                            />



                            {searchTerm && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        w-7
                                        h-7
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        text-gray-400
                                        hover:text-gray-700
                                        hover:bg-gray-200
                                    "
                                >

                                    <FaTimes />

                                </button>

                            )}

                        </div>



                        {/* DATE FILTER */}

                        <div
                            className="
                                relative
                            "
                        >

                            <FaFilter
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                    pointer-events-none
                                "
                            />



                            <select
                                value={dateFilter}
                                onChange={(e) =>
                                    setDateFilter(
                                        e.target.value
                                    )
                                }
                                className="
                                    h-12
                                    w-full
                                    lg:w-48
                                    pl-11
                                    pr-4
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    text-sm
                                    text-gray-700
                                    font-medium
                                    outline-none
                                    focus:bg-white
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                    cursor-pointer
                                "
                            >

                                <option value="ALL">
                                    All Dates
                                </option>

                                <option value="7_DAYS">
                                    Last 7 Days
                                </option>

                                <option value="30_DAYS">
                                    Last 30 Days
                                </option>

                                <option value="THIS_YEAR">
                                    This Year
                                </option>

                            </select>

                        </div>



                        {/* SORT */}

                        <button
                            type="button"
                            onClick={() =>
                                setSortOrder(
                                    (prev) =>
                                        prev ===
                                            "NEWEST"
                                            ? "OLDEST"
                                            : "NEWEST"
                                )
                            }
                            className="
                                h-12
                                lg:w-40
                                px-4
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                hover:bg-gray-100
                                text-sm
                                font-semibold
                                text-gray-700
                                flex
                                items-center
                                justify-center
                                gap-2
                                transition
                            "
                        >

                            {sortOrder ===
                                "NEWEST" ? (
                                <>
                                    <FaArrowDown />
                                    Newest
                                </>
                            ) : (
                                <>
                                    <FaArrowUp />
                                    Oldest
                                </>
                            )}

                        </button>



                        {/* CLEAR */}

                        {(searchTerm ||
                            dateFilter !==
                            "ALL" ||
                            sortOrder !==
                            "NEWEST") && (

                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                    className="
                                    h-12
                                    px-5
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    hover:bg-gray-50
                                    text-sm
                                    font-semibold
                                    text-gray-600
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    transition
                                "
                                >

                                    <FaTimes />

                                    Clear

                                </button>

                            )}

                    </div>

                </div>



                {/* ==================================
                    EMPTY STATE
                ================================== */}

                {filteredClaims.length ===
                    0 ? (

                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-12
                            text-center
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                mx-auto
                                w-20
                                h-20
                                rounded-full
                                bg-gray-100
                                flex
                                items-center
                                justify-center
                                text-gray-400
                                text-3xl
                            "
                        >

                            {searchTerm ||
                                dateFilter !==
                                "ALL" ? (
                                <FaSearch />
                            ) : (
                                <FaFileAlt />
                            )}

                        </div>



                        <h2
                            className="
                                mt-5
                                text-xl
                                font-semibold
                                text-gray-800
                            "
                        >

                            {searchTerm ||
                                dateFilter !==
                                "ALL"
                                ? "No Matching Refunds"
                                : "No Refund History"}

                        </h2>



                        <p
                            className="
                                mt-2
                                max-w-md
                                mx-auto
                                text-gray-500
                            "
                        >

                            {searchTerm ||
                                dateFilter !==
                                "ALL"
                                ? "Try changing your search or filter."
                                : "There are no successfully completed or returned claims available yet."}

                        </p>

                    </div>

                ) : (

                    /* ==================================
                       REFUND CARDS
                    ================================== */

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            xl:grid-cols-3
                            gap-6
                        "
                    >

                        {filteredClaims.map(
                            (claim) => {

                                const post =
                                    claim?.postId;



                                const image =
                                    post
                                        ?.images?.[0] ||
                                    null;



                                const imageUrl =
                                    getFileUrl(
                                        image
                                    );



                                return (

                                    <div
                                        key={
                                            claim?._id
                                        }
                                        className="
                                            group
                                            bg-white
                                            border
                                            border-gray-200
                                            rounded-2xl
                                            overflow-hidden
                                            shadow-sm
                                            hover:shadow-xl
                                            hover:-translate-y-1
                                            transition
                                            duration-300
                                        "
                                    >

                                        {/* ==========================
                                            IMAGE
                                        =========================== */}

                                        <div
                                            className="
                                                relative
                                                h-60
                                                bg-gray-100
                                                overflow-hidden
                                            "
                                        >

                                            {imageUrl ? (

                                                <img
                                                    src={
                                                        imageUrl
                                                    }
                                                    alt={
                                                        post
                                                            ?.description ||
                                                        "Returned item"
                                                    }
                                                    className="
                                                        w-full
                                                        h-full
                                                        object-cover
                                                        group-hover:scale-105
                                                        transition
                                                        duration-500
                                                    "
                                                    onError={(
                                                        e
                                                    ) => {

                                                        e.currentTarget.style.display =
                                                            "none";

                                                        const fallback =
                                                            e.currentTarget
                                                                .parentElement
                                                                ?.querySelector(
                                                                    ".image-fallback"
                                                                );

                                                        if (
                                                            fallback
                                                        ) {

                                                            fallback.style.display =
                                                                "flex";

                                                        }

                                                    }}
                                                />

                                            ) : null}



                                            {/* FALLBACK */}

                                            <div
                                                className="
                                                    image-fallback
                                                    w-full
                                                    h-full
                                                    items-center
                                                    justify-center
                                                    text-gray-400
                                                    text-5xl
                                                "
                                                style={{
                                                    display:
                                                        imageUrl
                                                            ? "none"
                                                            : "flex",
                                                }}
                                            >

                                                <FaBoxOpen />

                                            </div>



                                            {/* GRADIENT */}

                                            <div
                                                className="
                                                    absolute
                                                    inset-x-0
                                                    bottom-0
                                                    h-24
                                                    bg-gradient-to-t
                                                    from-black/50
                                                    to-transparent
                                                    pointer-events-none
                                                "
                                            />



                                            {/* BADGE */}

                                            <div
                                                className="
                                                    absolute
                                                    top-4
                                                    right-4
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    px-3
                                                    py-2
                                                    rounded-full
                                                    bg-green-600
                                                    text-white
                                                    text-xs
                                                    font-bold
                                                    shadow-lg
                                                "
                                            >

                                                <FaCheckCircle />

                                                Refunded

                                            </div>

                                        </div>



                                        {/* ==========================
                                            CONTENT
                                        =========================== */}

                                        <div
                                            className="
                                                p-5
                                            "
                                        >

                                            <p
                                                className="
                                                    text-xs
                                                    font-semibold
                                                    uppercase
                                                    tracking-wider
                                                    text-green-600
                                                "
                                            >
                                                Returned Item
                                            </p>



                                            <h2
                                                className="
                                                    mt-1
                                                    text-xl
                                                    font-bold
                                                    text-gray-900
                                                    line-clamp-2
                                                "
                                            >

                                                {post
                                                    ?.description ||
                                                    "Returned Item"}

                                            </h2>



                                            {/* STATUS */}

                                            <div
                                                className="
                                                    mt-3
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    px-3
                                                    py-1.5
                                                    rounded-full
                                                    bg-green-50
                                                    border
                                                    border-green-100
                                                    text-green-700
                                                    text-xs
                                                    font-bold
                                                "
                                            >

                                                <FaCheckCircle />

                                                Successfully Returned

                                            </div>



                                            {/* DATE BOX */}

                                            <div
                                                className="
                                                    mt-5
                                                    rounded-xl
                                                    bg-gray-50
                                                    border
                                                    border-gray-100
                                                    p-4
                                                    space-y-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                        text-sm
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-gray-500
                                                        "
                                                    >

                                                        <FaCalendarAlt />

                                                        Claim Date

                                                    </div>



                                                    <span
                                                        className="
                                                            font-semibold
                                                            text-gray-800
                                                        "
                                                    >

                                                        {
                                                            formatDate(
                                                                claim?.createdAt
                                                            )
                                                        }

                                                    </span>

                                                </div>



                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                        text-sm
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-gray-500
                                                        "
                                                    >

                                                        <FaCheckCircle />

                                                        Refund Date

                                                    </div>



                                                    <span
                                                        className="
                                                            font-semibold
                                                            text-green-600
                                                        "
                                                    >

                                                        {
                                                            formatDate(
                                                                claim?.completedAt ||
                                                                claim?.updatedAt
                                                            )
                                                        }

                                                    </span>

                                                </div>

                                            </div>



                                            {/* CLAIMER */}

                                            {claim?.claimerId && (

                                                <div
                                                    className="
                                                        mt-5
                                                        flex
                                                        items-center
                                                        gap-3
                                                    "
                                                >

                                                    {claim
                                                        ?.claimerId
                                                        ?.picture ? (

                                                        <img
                                                            src={
                                                                getFileUrl(
                                                                    claim
                                                                        .claimerId
                                                                        .picture
                                                                )
                                                            }
                                                            alt={
                                                                claim
                                                                    .claimerId
                                                                    ?.name ||
                                                                "Claimer"
                                                            }
                                                            className="
                                                                w-11
                                                                h-11
                                                                rounded-full
                                                                object-cover
                                                                border
                                                                border-gray-200
                                                            "
                                                        />

                                                    ) : (

                                                        <div
                                                            className="
                                                                w-11
                                                                h-11
                                                                rounded-full
                                                                bg-gray-100
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-gray-400
                                                            "
                                                        >

                                                            <FaUserShield />

                                                        </div>

                                                    )}



                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-gray-400
                                                                uppercase
                                                                font-semibold
                                                            "
                                                        >
                                                            Claimer
                                                        </p>



                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-gray-800
                                                                truncate
                                                            "
                                                        >

                                                            {
                                                                claim
                                                                    .claimerId
                                                                    ?.name ||
                                                                "Unknown User"
                                                            }

                                                        </p>

                                                    </div>

                                                </div>

                                            )}



                                            {/* VIEW DETAILS */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedClaim(
                                                        claim
                                                    )
                                                }
                                                className="
                                                    mt-5
                                                    w-full
                                                    h-11
                                                    rounded-xl
                                                    bg-gray-900
                                                    hover:bg-gray-800
                                                    text-white
                                                    text-sm
                                                    font-semibold
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    transition
                                                "
                                            >

                                                <FaEye />

                                                View Details

                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>



            {/* ======================================================
                DETAILS MODAL
            ======================================================= */}

            {selectedClaim && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        bg-black/60
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        p-3
                        sm:p-5
                    "
                    onClick={
                        closeDetailsModal
                    }
                >

                    <div
                        className="
                            relative
                            w-full
                            max-w-6xl
                            max-h-[94vh]
                            overflow-y-auto
                            bg-white
                            rounded-3xl
                            shadow-2xl
                        "
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* ======================================
                            MODAL HEADER
                        ======================================= */}

                        <div
                            className="
                                sticky
                                top-0
                                z-30
                                bg-white
                                border-b
                                border-gray-200
                                px-5
                                sm:px-7
                                py-4
                                flex
                                items-center
                                justify-between
                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        w-11
                                        h-11
                                        rounded-xl
                                        bg-green-100
                                        text-green-600
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    <FaClipboardCheck />

                                </div>



                                <div>

                                    <h2
                                        className="
                                            text-xl
                                            sm:text-2xl
                                            font-bold
                                            text-gray-900
                                        "
                                    >
                                        Refund Details
                                    </h2>



                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-0.5
                                            font-mono
                                        "
                                    >

                                        ID:{" "}
                                        {
                                            selectedClaim
                                                ?._id
                                        }

                                    </p>

                                </div>

                            </div>



                            <button
                                type="button"
                                onClick={
                                    closeDetailsModal
                                }
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-gray-100
                                    hover:bg-gray-200
                                    text-gray-600
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                "
                            >

                                <FaTimes />

                            </button>

                        </div>



                        {/* ======================================
                            MODAL CONTENT
                        ======================================= */}

                        <div
                            className="
                                p-5
                                sm:p-7
                            "
                        >

                            {/* ==================================
                                ITEM INFORMATION
                            ================================== */}

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    lg:grid-cols-2
                                    gap-6
                                "
                            >

                                {/* ITEM IMAGE */}

                                <div>

                                    <h3
                                        className="
                                            text-sm
                                            font-bold
                                            text-gray-800
                                            mb-3
                                        "
                                    >
                                        Returned Item
                                    </h3>



                                    <div
                                        className="
                                            relative
                                            h-72
                                            sm:h-80
                                            rounded-2xl
                                            overflow-hidden
                                            bg-gray-100
                                            border
                                            border-gray-200
                                        "
                                    >

                                        {getFileUrl(
                                            selectedClaim
                                                ?.postId
                                                ?.images?.[0]
                                        ) ? (

                                            <img
                                                src={
                                                    getFileUrl(
                                                        selectedClaim
                                                            ?.postId
                                                            ?.images?.[0]
                                                    )
                                                }
                                                alt={
                                                    selectedClaim
                                                        ?.postId
                                                        ?.description ||
                                                    "Returned item"
                                                }
                                                className="
                                                    w-full
                                                    h-full
                                                    object-cover
                                                "
                                            />

                                        ) : (

                                            <div
                                                className="
                                                    w-full
                                                    h-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-gray-400
                                                    text-6xl
                                                "
                                            >

                                                <FaBoxOpen />

                                            </div>

                                        )}

                                    </div>

                                </div>



                                {/* ITEM DETAILS */}

                                <div>

                                    <h3
                                        className="
                                            text-sm
                                            font-bold
                                            text-gray-800
                                            mb-3
                                        "
                                    >
                                        Item Information
                                    </h3>



                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-gray-50
                                            p-5
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                text-gray-400
                                                uppercase
                                                font-semibold
                                            "
                                        >
                                            Description
                                        </p>



                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                text-gray-800
                                                leading-6
                                            "
                                        >

                                            {
                                                selectedClaim
                                                    ?.postId
                                                    ?.description ||
                                                "No description available."
                                            }

                                        </p>



                                        <div
                                            className="
                                                mt-5
                                                pt-4
                                                border-t
                                                border-gray-200
                                                space-y-4
                                            "
                                        >

                                            {/* STATUS */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >
                                                    Status
                                                </span>



                                                <span
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        px-3
                                                        py-1.5
                                                        rounded-full
                                                        bg-green-100
                                                        text-green-700
                                                        text-xs
                                                        font-bold
                                                    "
                                                >

                                                    <FaCheckCircle />

                                                    COMPLETED

                                                </span>

                                            </div>



                                            {/* CLAIM DATE */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >
                                                    Claim Date
                                                </span>



                                                <span
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >

                                                    {
                                                        formatDateTime(
                                                            selectedClaim
                                                                ?.createdAt
                                                        )
                                                    }

                                                </span>

                                            </div>



                                            {/* REFUND DATE */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >
                                                    Refund Date
                                                </span>



                                                <span
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-green-600
                                                    "
                                                >

                                                    {
                                                        formatDateTime(
                                                            selectedClaim
                                                                ?.completedAt
                                                        )
                                                    }

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>



                            {/* ==================================
                                CLAIMER INFORMATION
                            ================================== */}

                            <div
                                className="
                                    mt-8
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        mb-4
                                    "
                                >

                                    <FaUserShield
                                        className="
                                            text-green-600
                                        "
                                    />

                                    <h3
                                        className="
                                            text-lg
                                            font-bold
                                            text-gray-900
                                        "
                                    >
                                        Claimer Information
                                    </h3>

                                </div>



                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        lg:grid-cols-2
                                        gap-5
                                    "
                                >

                                    {/* CLAIMER PROFILE */}

                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-4
                                            "
                                        >

                                            {selectedClaim
                                                ?.claimerId
                                                ?.picture ? (

                                                <img
                                                    src={
                                                        getFileUrl(
                                                            selectedClaim
                                                                .claimerId
                                                                .picture
                                                        )
                                                    }
                                                    alt={
                                                        selectedClaim
                                                            ?.claimerId
                                                            ?.name ||
                                                        "Claimer"
                                                    }
                                                    className="
                                                        w-16
                                                        h-16
                                                        rounded-full
                                                        object-cover
                                                        border
                                                        border-gray-200
                                                    "
                                                />

                                            ) : (

                                                <div
                                                    className="
                                                        w-16
                                                        h-16
                                                        rounded-full
                                                        bg-gray-100
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-gray-400
                                                        text-xl
                                                    "
                                                >

                                                    <FaUserShield />

                                                </div>

                                            )}



                                            <div>

                                                <p
                                                    className="
                                                        text-lg
                                                        font-bold
                                                        text-gray-900
                                                    "
                                                >

                                                    {
                                                        selectedClaim
                                                            ?.claimerId
                                                            ?.name ||
                                                        "Unknown User"
                                                    }

                                                </p>



                                                <p
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                        break-all
                                                    "
                                                >

                                                    {
                                                        selectedClaim
                                                            ?.claimerId
                                                            ?.email ||
                                                        "No email"
                                                    }

                                                </p>

                                            </div>

                                        </div>



                                        {/* PHONE */}

                                        <div
                                            className="
                                                mt-5
                                                pt-4
                                                border-t
                                                border-gray-100
                                                flex
                                                items-start
                                                gap-3
                                            "
                                        >

                                            <FaPhone
                                                className="
                                                    mt-1
                                                    text-gray-400
                                                "
                                            />

                                            <div>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-400
                                                    "
                                                >
                                                    Phone
                                                </p>



                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >

                                                    {
                                                        selectedClaim
                                                            ?.claimerId
                                                            ?.phone ||
                                                        "N/A"
                                                    }

                                                </p>

                                            </div>

                                        </div>



                                        {/* INSTITUTION */}

                                        <div
                                            className="
                                                mt-4
                                                flex
                                                items-start
                                                gap-3
                                            "
                                        >

                                            <FaUniversity
                                                className="
                                                    mt-1
                                                    text-gray-400
                                                "
                                            />

                                            <div>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-400
                                                    "
                                                >
                                                    Institution ID
                                                </p>



                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >

                                                    {
                                                        selectedClaim
                                                            ?.claimerId
                                                            ?.institutionId ||
                                                        "N/A"
                                                    }

                                                </p>

                                            </div>

                                        </div>

                                    </div>



                                    {/* CLAIMER IMAGE */}

                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                mb-4
                                            "
                                        >

                                            <FaIdCard
                                                className="
                                                    text-blue-600
                                                "
                                            />

                                            <h4
                                                className="
                                                    text-sm
                                                    font-bold
                                                    text-gray-800
                                                "
                                            >
                                                Claimer Image
                                            </h4>

                                        </div>

                                        {selectedClaim?.claimerImage ? (

                                            <>

                                                <div
                                                    className="
                                                        h-52
                                                        rounded-xl
                                                        overflow-hidden
                                                        bg-gray-100
                                                        border
                                                        border-gray-200
                                                        cursor-pointer
                                                    "
                                                    onClick={() =>
                                                        setPreviewFile({
                                                            title: "Claimer Image",
                                                            file: selectedClaim.claimerImage,
                                                        })
                                                    }
                                                >

                                                    <img
                                                        src={getFileUrl(selectedClaim.claimerImage)}
                                                        alt="Claimer"
                                                        className="
                                                            w-full
                                                            h-full
                                                            object-contain
                                                        "
                                                        onError={(e) => {
                                                            console.error(
                                                                "Claimer image failed:",
                                                                getFileUrl(selectedClaim.claimerImage)
                                                            );
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openFile(selectedClaim.claimerImage)
                                                    }
                                                    className="
                                                        mt-3
                                                        w-full
                                                        h-10
                                                        rounded-xl
                                                        bg-gray-900
                                                        hover:bg-gray-800
                                                        text-white
                                                        text-xs
                                                        font-semibold
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                    "
                                                >

                                                    <FaExternalLinkAlt />

                                                    Open Claimer Image

                                                </button>

                                            </>

                                        ) : (

                                            <div
                                                className="
                                                    h-52
                                                    rounded-xl
                                                    bg-gray-50
                                                    border
                                                    border-dashed
                                                    border-gray-300
                                                    flex
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    text-gray-400
                                                "
                                            >

                                                <FaIdCard
                                                    className="
                                                        text-3xl
                                                        mb-2
                                                    "
                                                />

                                                <p className="text-sm">
                                                    Claimer image unavailable
                                                </p>

                                            </div>

                                        )}

                                    </div>
                                </div>

                            </div>



                            {/* ==================================
                                RESPONSIBLE PERSON
                            ================================== */}

                            <div
                                className="
                                    mt-8
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        mb-4
                                    "
                                >

                                    <FaUserShield
                                        className="
                                            text-green-600
                                        "
                                    />

                                    <h3
                                        className="
                                            text-lg
                                            font-bold
                                            text-gray-900
                                        "
                                    >
                                        Responsible Person
                                    </h3>

                                </div>



                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        lg:grid-cols-2
                                        gap-5
                                    "
                                >

                                    {/* PERSON INFO */}

                                    <div
                                        className="
                                            rounded-2xl
                                            bg-green-50
                                            border
                                            border-green-100
                                            p-5
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                text-green-600
                                                uppercase
                                                font-bold
                                                tracking-wide
                                            "
                                        >
                                            Verified By
                                        </p>



                                        <p
                                            className="
                                                mt-2
                                                text-xl
                                                font-bold
                                                text-gray-900
                                            "
                                        >

                                            {
                                                selectedClaim
                                                    ?.responsiblePersonId
                                                    ?.name ||
                                                "Responsible Person"
                                            }

                                        </p>



                                        <p
                                            className="
                                                mt-1
                                                text-sm
                                                text-gray-600
                                                break-all
                                            "
                                        >

                                            {
                                                selectedClaim
                                                    ?.responsiblePersonId
                                                    ?.email ||
                                                "No email"
                                            }

                                        </p>



                                        {selectedClaim
                                            ?.responsiblePersonId
                                            ?.phone && (

                                                <p
                                                    className="
                                                    mt-3
                                                    text-sm
                                                    text-gray-600
                                                "
                                                >

                                                    Phone:{" "}
                                                    {
                                                        selectedClaim
                                                            .responsiblePersonId
                                                            .phone
                                                    }

                                                </p>

                                            )}

                                    </div>



                                    {/* CLAIMER PROOF */}

                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                                mb-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                <FaFileAlt
                                                    className="
                                                        text-purple-600
                                                    "
                                                />

                                                <h4
                                                    className="
                                                        text-sm
                                                        font-bold
                                                        text-gray-800
                                                    "
                                                >
                                                    Claimer Proof Document
                                                </h4>

                                            </div>

                                        </div>



                                        {selectedClaim
                                            ?.proofDocument ? (

                                            <>

                                                <div
                                                    className="
                                                        h-52
                                                        rounded-xl
                                                        overflow-hidden
                                                        bg-gray-100
                                                        border
                                                        border-gray-200
                                                        cursor-pointer
                                                    "
                                                    onClick={() =>
                                                        setPreviewFile(
                                                            {
                                                                title:
                                                                    "Claimer Proof Document",
                                                                file:
                                                                    selectedClaim
                                                                        .proofDocument,
                                                            }
                                                        )
                                                    }
                                                >

                                                    <img
                                                        src={
                                                            getFileUrl(
                                                                selectedClaim
                                                                    .proofDocument
                                                            )
                                                        }
                                                        alt="Claimer proof"
                                                        className="
                                                            w-full
                                                            h-full
                                                            object-contain
                                                        "
                                                    />

                                                </div>



                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openFile(
                                                            selectedClaim
                                                                .proofDocument
                                                        )
                                                    }
                                                    className="
                                                        mt-3
                                                        w-full
                                                        h-10
                                                        rounded-xl
                                                        bg-gray-900
                                                        hover:bg-gray-800
                                                        text-white
                                                        text-xs
                                                        font-semibold
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                    "
                                                >

                                                    <FaExternalLinkAlt />

                                                    Open Proof Document

                                                </button>

                                            </>

                                        ) : (

                                            <div
                                                className="
                                                    h-52
                                                    rounded-xl
                                                    bg-gray-50
                                                    border
                                                    border-dashed
                                                    border-gray-300
                                                    flex
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    text-gray-400
                                                "
                                            >

                                                <FaFileAlt
                                                    className="
                                                        text-3xl
                                                        mb-2
                                                    "
                                                />

                                                <p
                                                    className="
                                                        text-sm
                                                    "
                                                >
                                                    Proof document unavailable
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>



                            {/* ==================================
                                REMARKS
                            ================================== */}

                            <div
                                className="
                                    mt-8
                                "
                            >

                                <h3
                                    className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                        mb-4
                                    "
                                >
                                    Verification Remarks
                                </h3>



                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        lg:grid-cols-2
                                        gap-5
                                    "
                                >

                                    {/* INITIAL REMARK */}

                                    <div
                                        className="
                                            rounded-2xl
                                            bg-blue-50
                                            border
                                            border-blue-100
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <FaInfoCircle
                                                className="
                                                    text-blue-600
                                                "
                                            />

                                            <p
                                                className="
                                                    text-sm
                                                    font-bold
                                                    text-blue-800
                                                "
                                            >
                                                Initial Verification
                                            </p>

                                        </div>



                                        <p
                                            className="
                                                mt-3
                                                text-sm
                                                leading-6
                                                text-gray-700
                                            "
                                        >

                                            {
                                                selectedClaim
                                                    ?.initialRemark ||
                                                "No initial verification remark was provided."
                                            }

                                        </p>

                                    </div>



                                    {/* PHYSICAL REMARK */}

                                    <div
                                        className="
                                            rounded-2xl
                                            bg-green-50
                                            border
                                            border-green-100
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <FaCheckCircle
                                                className="
                                                    text-green-600
                                                "
                                            />

                                            <p
                                                className="
                                                    text-sm
                                                    font-bold
                                                    text-green-800
                                                "
                                            >
                                                Physical Verification
                                            </p>

                                        </div>



                                        <p
                                            className="
                                                mt-3
                                                text-sm
                                                leading-6
                                                text-gray-700
                                            "
                                        >

                                            {
                                                selectedClaim
                                                    ?.physicalVerificationRemark ||
                                                "No physical verification remark was provided."
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>



                            {/* ==================================
                                CLAIM TIMELINE
                            ================================== */}

                            <div
                                className="
                                    mt-8
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    p-5
                                "
                            >

                                <h3
                                    className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                        mb-5
                                    "
                                >
                                    Claim Timeline
                                </h3>



                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        lg:grid-cols-4
                                        gap-4
                                    "
                                >

                                    {/* CREATED */}

                                    <div
                                        className="
                                            bg-white
                                            rounded-xl
                                            p-4
                                            border
                                            border-gray-200
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                text-gray-400
                                                uppercase
                                                font-semibold
                                            "
                                        >
                                            Claim Created
                                        </p>



                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                font-semibold
                                                text-gray-800
                                            "
                                        >

                                            {
                                                formatDateTime(
                                                    selectedClaim
                                                        ?.createdAt
                                                )
                                            }

                                        </p>

                                    </div>



                                    {/* INITIAL APPROVED */}

                                    <div
                                        className="
                                            bg-white
                                            rounded-xl
                                            p-4
                                            border
                                            border-gray-200
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                text-gray-400
                                                uppercase
                                                font-semibold
                                            "
                                        >
                                            Initial Approved
                                        </p>



                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                font-semibold
                                                text-gray-800
                                            "
                                        >

                                            {
                                                formatDateTime(
                                                    selectedClaim
                                                        ?.initialApprovedAt
                                                )
                                            }

                                        </p>

                                    </div>



                                    {/* PHYSICAL */}

                                    <div
                                        className="
                                            bg-white
                                            rounded-xl
                                            p-4
                                            border
                                            border-gray-200
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                text-gray-400
                                                uppercase
                                                font-semibold
                                            "
                                        >
                                            Physical Verification
                                        </p>



                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                font-semibold
                                                text-gray-800
                                            "
                                        >

                                            {
                                                formatDateTime(
                                                    selectedClaim
                                                        ?.physicalVerificationAt
                                                )
                                            }

                                        </p>

                                    </div>



                                    {/* COMPLETED */}

                                    <div
                                        className="
                                            bg-green-50
                                            rounded-xl
                                            p-4
                                            border
                                            border-green-100
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                text-green-600
                                                uppercase
                                                font-semibold
                                            "
                                        >
                                            Completed / Returned
                                        </p>



                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                font-bold
                                                text-green-700
                                            "
                                        >

                                            {
                                                formatDateTime(
                                                    selectedClaim
                                                        ?.completedAt
                                                )
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>



                            {/* ==================================
                                FOOTER
                            ================================== */}

                            <div
                                className="
                                    mt-7
                                    flex
                                    justify-end
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeDetailsModal
                                    }
                                    className="
                                        px-6
                                        h-11
                                        rounded-xl
                                        bg-gray-900
                                        hover:bg-gray-800
                                        text-white
                                        text-sm
                                        font-semibold
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <FaTimes />

                                    Close

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}



            {/* ======================================================
                FILE PREVIEW MODAL
            ======================================================= */}

            {previewFile && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[10000]
                        bg-black/85
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                    onClick={() =>
                        setPreviewFile(null)
                    }
                >

                    <div
                        className="
                            relative
                            w-full
                            max-w-6xl
                            h-[90vh]
                            flex
                            flex-col
                            items-center
                            justify-center
                        "
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* TITLE */}

                        <div
                            className="
                                absolute
                                top-0
                                left-0
                                right-0
                                flex
                                items-center
                                justify-between
                                gap-4
                                text-white
                                bg-black/40
                                rounded-xl
                                px-4
                                py-3
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                "
                            >
                                {
                                    previewFile.title
                                }
                            </p>



                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewFile(
                                        null
                                    )
                                }
                                className="
                                    w-9
                                    h-9
                                    rounded-lg
                                    bg-white
                                    text-gray-800
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-gray-100
                                "
                            >

                                <FaTimes />

                            </button>

                        </div>



                        {/* FILE */}

                        <div
                            className="
                                w-full
                                h-full
                                pt-16
                                pb-3
                                flex
                                items-center
                                justify-center
                            "
                        >

                            {(() => {
                                const fileUrl = getFileUrl(previewFile.file);
                                const rawFile =
                                    typeof previewFile.file === "string"
                                        ? previewFile.file
                                        : fileUrl || "";
                                const lowerFile = rawFile.toLowerCase();

                                const isPdf =
                                    lowerFile.includes("application/pdf") ||
                                    lowerFile.split("?")[0].endsWith(".pdf") ||
                                    fileUrl?.toLowerCase().split("?")[0].endsWith(".pdf");

                                const isImage =
                                    /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(
                                        lowerFile.split("?")[0]
                                    ) ||
                                    /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(
                                        fileUrl || ""
                                    );

                                if (!fileUrl) {
                                    return (
                                        <div className="text-center text-white">
                                            <FaFileAlt className="text-5xl mx-auto mb-3" />
                                            <p>File unavailable</p>
                                        </div>
                                    );
                                }

                                if (isPdf) {
                                    return (
                                        <iframe
                                            src={fileUrl}
                                            title={previewFile.title}
                                            className="
                                                w-full
                                                h-full
                                                rounded-xl
                                                bg-white
                                                shadow-2xl
                                            "
                                        />
                                    );
                                }

                                if (isImage || !lowerFile.includes(".")) {
                                    return (
                                        <img
                                            src={fileUrl}
                                            alt={previewFile.title}
                                            className="
                                                max-w-full
                                                max-h-full
                                                w-auto
                                                h-auto
                                                object-contain
                                                rounded-xl
                                                shadow-2xl
                                                bg-white
                                            "
                                            onLoad={() =>
                                                console.log(
                                                    "Preview loaded:",
                                                    fileUrl
                                                )
                                            }
                                            onError={(e) => {
                                                console.error(
                                                    "Preview image failed:",
                                                    fileUrl
                                                );
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <div className="text-center text-white">
                                        <FaFileAlt className="text-5xl mx-auto mb-3" />
                                        <p className="mb-3">Preview not available</p>
                                        <p className="text-xs text-gray-300 break-all">
                                            {fileUrl}
                                        </p>
                                    </div>
                                );
                            })()}

                        </div>



                        {/* OPEN */}

                        <button
                            type="button"
                            onClick={() =>
                                openFile(
                                    previewFile.file
                                )
                            }
                            className="
                                absolute
                                bottom-0
                                right-0
                                px-5
                                h-10
                                rounded-xl
                                bg-white
                                text-gray-900
                                text-sm
                                font-semibold
                                flex
                                items-center
                                gap-2
                                hover:bg-gray-100
                            "
                        >

                            <FaExternalLinkAlt />

                            Open File

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

};



export default Refund;
