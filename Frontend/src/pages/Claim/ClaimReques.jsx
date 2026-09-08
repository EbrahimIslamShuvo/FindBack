import React, {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
    FiArrowLeft,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiFileText,
    FiUser,
    FiPackage,
    FiShield,
    FiAlertCircle,
    FiEye,
    FiRefreshCw,
    FiX,
    FiUpload,
    FiPlayCircle,
} from "react-icons/fi";

import {
    MdOutlineRateReview,
} from "react-icons/md";


// ==========================================
// API
// ==========================================

const API_URL =
    "http://localhost:3000";


// ==========================================
// COMPONENT
// ==========================================

const ClaimReques = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // AUTH
    // ==========================================

    const token =
        localStorage.getItem(
            "findback_token"
        );


    const storedUser =
        localStorage.getItem(
            "findback_user"
        );


    let currentUser = null;


    try {

        currentUser =
            storedUser
                ? JSON.parse(
                    storedUser
                )
                : null;

    } catch {

        currentUser =
            null;

    }


    // ==========================================
    // ROLE
    // ==========================================

    const isAdmin =
        currentUser?.userType ===
        "ADMIN";


    const isResponsible =
        currentUser?.userType ===
        "RESPONSIBLE_PERSON";


    // ==========================================
    // CLAIMS
    // ==========================================

    const [
        claims,
        setClaims,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        processingId,
        setProcessingId,
    ] = useState(null);


    // ==========================================
    // DETAILS MODAL
    // ==========================================

    const [
        selectedClaim,
        setSelectedClaim,
    ] = useState(null);


    const [
        showDetails,
        setShowDetails,
    ] = useState(false);


    // ==========================================
    // APPROVE MODAL
    // ==========================================

    const [
        showApproveModal,
        setShowApproveModal,
    ] = useState(false);


    const [
        approveClaim,
        setApproveClaim,
    ] = useState(null);


    const [
        approveRemark,
        setApproveRemark,
    ] = useState("");


    // ==========================================
    // INITIAL REJECT MODAL
    // ==========================================

    const [
        showRejectModal,
        setShowRejectModal,
    ] = useState(false);


    const [
        rejectClaim,
        setRejectClaim,
    ] = useState(null);


    const [
        rejectReason,
        setRejectReason,
    ] = useState("");


    // ==========================================
    // PHYSICAL VERIFICATION REJECT MODAL
    // ==========================================

    const [
        showPhysicalRejectModal,
        setShowPhysicalRejectModal,
    ] = useState(false);


    const [
        physicalRejectClaimData,
        setPhysicalRejectClaimData,
    ] = useState(null);


    const [
        physicalRejectReason,
        setPhysicalRejectReason,
    ] = useState("");


    // ==========================================
    // PHYSICAL VERIFICATION START MODAL
    // ==========================================

    const [
        showVerificationModal,
        setShowVerificationModal,
    ] = useState(false);


    const [
        verificationClaim,
        setVerificationClaim,
    ] = useState(null);


    // ==========================================
    // REFOUNDED MODAL
    // ==========================================

    const [
        showCompleteModal,
        setShowCompleteModal,
    ] = useState(false);


    const [
        completeClaimData,
        setCompleteClaimData,
    ] = useState(null);


    const [
        responsibleDocument,
        setResponsibleDocument,
    ] = useState(null);


    const [
        responsibleStudentIdCard,
        setResponsibleStudentIdCard,
    ] = useState(null);


    const [
        completeRemark,
        setCompleteRemark,
    ] = useState("");


    // ==========================================
    // FILE PREVIEW
    // ==========================================

    const [
        responsibleDocumentPreview,
        setResponsibleDocumentPreview,
    ] = useState("");


    const [
        studentIdPreview,
        setStudentIdPreview,
    ] = useState("");


    // ==========================================
    // AUTH CHECK
    // ==========================================

    useEffect(() => {

        if (
            !token ||
            !currentUser
        ) {

            navigate(
                "/login",
                {
                    replace: true,
                }
            );

            return;

        }


        if (
            !isAdmin &&
            !isResponsible
        ) {

            navigate(
                "/",
                {
                    replace: true,
                }
            );

        }

    }, [
        token,
        currentUser,
        isAdmin,
        isResponsible,
        navigate,
    ]);


    // ==========================================
    // IMAGE URL
    // ==========================================

    const getImageUrl = (
        image
    ) => {

        if (!image) {

            return "";

        }


        if (
            image.startsWith(
                "http://"
            ) ||
            image.startsWith(
                "https://"
            )
        ) {

            return image;

        }


        return `${API_URL}/${image.replace(
            /^\/+/,
            ""
        )}`;

    };


    // ==========================================
    // HANDLE 401
    // ==========================================

    const handleUnauthorized = (
        err
    ) => {

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

            navigate(
                "/login",
                {
                    replace: true,
                }
            );

            return true;

        }

        return false;

    };


    // ==========================================
    // FETCH CLAIM REQUESTS
    // ==========================================

    const fetchClaims =
        async () => {

            if (!token) {

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;

            }


            try {

                setLoading(
                    true
                );

                setError("");


                const response =
                    await axios.get(

                        `${API_URL}/api/claims/responsible/pending`,

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


                // ==================================
                // ONLY ACTIVE WORKFLOW CLAIMS
                // ==================================

                const activeClaims =
                    Array.isArray(
                        claimData
                    )
                        ? claimData.filter(
                            (claim) =>
                                claim?.status !==
                                "COMPLETED"
                        )
                        : [];


                setClaims(
                    activeClaims
                );

            } catch (err) {

                console.error(
                    "CLAIM REQUEST ERROR:",
                    err?.response?.data ||
                    err
                );


                if (
                    handleUnauthorized(
                        err
                    )
                ) {

                    return;

                }


                if (
                    err?.response?.status ===
                    403
                ) {

                    setError(
                        "You do not have permission to view claim requests."
                    );

                    return;

                }


                setError(
                    err?.response?.data
                        ?.message ||
                    "Failed to load claim requests."
                );

            } finally {

                setLoading(
                    false
                );

            }

        };


    // ==========================================
    // LOAD
    // ==========================================

    useEffect(() => {

        if (
            token &&
            (
                isAdmin ||
                isResponsible
            )
        ) {

            fetchClaims();

        }

    }, [
        token,
        isAdmin,
        isResponsible,
    ]);


    // ==========================================
    // DATE FORMAT
    // ==========================================

    const formatDate =
        (
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


    // ==========================================
    // GET POST
    // ==========================================

    const getPost =
        (
            claim
        ) => {

            return (
                claim?.postId ||
                claim?.post ||
                null
            );

        };


    // ==========================================
    // OPEN DETAILS
    // ==========================================

    const openDetails =
        (
            claim
        ) => {

            setSelectedClaim(
                claim
            );

            setShowDetails(
                true
            );

        };


    // ==========================================
    // CLOSE DETAILS
    // ==========================================

    const closeDetails =
        () => {

            setSelectedClaim(
                null
            );

            setShowDetails(
                false
            );

        };


    // ==========================================
    // OPEN APPROVE MODAL
    // ==========================================

    const openApproveModal =
        (
            claim
        ) => {

            setApproveClaim(
                claim
            );

            setApproveRemark(
                ""
            );

            setShowApproveModal(
                true
            );

        };


    // ==========================================
    // CLOSE APPROVE MODAL
    // ==========================================

    const closeApproveModal =
        () => {

            setApproveClaim(
                null
            );

            setApproveRemark(
                ""
            );

            setShowApproveModal(
                false
            );

        };


    // ==========================================
    // CONFIRM APPROVE
    // ==========================================

    const confirmApprove =
        async () => {

            if (
                !approveClaim?._id
            ) {

                return;

            }


            try {

                setProcessingId(
                    approveClaim._id
                );

                setError("");


                await axios.patch(

                    `${API_URL}/api/claims/${approveClaim._id}/initial-approve`,

                    {
                        remark:
                            approveRemark.trim(),
                    },

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                // ==================================
                // UPDATE CLAIM IN LIST
                // ==================================

                setClaims(
                    (prev) =>
                        prev.map(
                            (item) => {

                                if (
                                    item._id ===
                                    approveClaim._id
                                ) {

                                    return {

                                        ...item,

                                        status:
                                            "INITIAL_APPROVED",

                                        initialRemark:
                                            approveRemark.trim(),

                                    };

                                }


                                return item;

                            }
                        )
                );


                closeApproveModal();


                closeDetails();

            } catch (err) {

                console.error(
                    "APPROVE ERROR:",
                    err?.response?.data ||
                    err
                );


                if (
                    handleUnauthorized(
                        err
                    )
                ) {

                    return;

                }


                setError(
                    err?.response?.data
                        ?.message ||
                    "Failed to approve claim."
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // OPEN INITIAL REJECT MODAL
    // ==========================================

    const openRejectModal =
        (
            claim
        ) => {

            setRejectClaim(
                claim
            );

            setRejectReason(
                ""
            );

            setShowRejectModal(
                true
            );

        };


    // ==========================================
    // CLOSE INITIAL REJECT MODAL
    // ==========================================

    const closeRejectModal =
        () => {

            setRejectClaim(
                null
            );

            setRejectReason(
                ""
            );

            setShowRejectModal(
                false
            );

        };


    // ==========================================
    // CONFIRM INITIAL REJECT
    // ==========================================

    const confirmReject =
        async () => {

            if (
                !rejectClaim?._id
            ) {

                return;

            }


            const reason =
                rejectReason.trim();


            if (!reason) {

                setError(
                    "Rejection reason is required."
                );

                return;

            }


            try {

                setProcessingId(
                    rejectClaim._id
                );

                setError("");


                await axios.patch(

                    `${API_URL}/api/claims/${rejectClaim._id}/initial-reject`,

                    {
                        reason,
                    },

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                // ==================================
                // KEEP INITIAL_REJECTED IN THE LIST
                // ==================================
                // This claim can be approved again later.
                setClaims(
                    (prev) =>
                        prev.map(
                            (item) => {

                                if (
                                    item._id ===
                                    rejectClaim._id
                                ) {

                                    return {
                                        ...item,
                                        status:
                                            "INITIAL_REJECTED",
                                        rejectionReason:
                                            reason,
                                    };

                                }

                                return item;

                            }
                        )
                );


                closeRejectModal();


                closeDetails();

            } catch (err) {

                console.error(
                    "INITIAL REJECT ERROR:",
                    err?.response?.data ||
                    err
                );


                if (
                    handleUnauthorized(
                        err
                    )
                ) {

                    return;

                }


                setError(
                    err?.response?.data
                        ?.message ||
                    "Failed to reject claim."
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // OPEN PHYSICAL VERIFICATION MODAL
    // ==========================================

    const openVerificationModal =
        (
            claim
        ) => {

            setVerificationClaim(
                claim
            );

            setShowVerificationModal(
                true
            );

        };


    // ==========================================
    // CLOSE PHYSICAL VERIFICATION MODAL
    // ==========================================

    const closeVerificationModal =
        () => {

            setVerificationClaim(
                null
            );

            setShowVerificationModal(
                false
            );

        };


    // ==========================================
    // START PHYSICAL VERIFICATION
    // ==========================================

    const confirmPhysicalVerification =
        async () => {

            if (
                !verificationClaim?._id
            ) {

                return;

            }


            try {

                setProcessingId(
                    verificationClaim._id
                );

                setError("");


                await axios.patch(

                    `${API_URL}/api/claims/${verificationClaim._id}/physical-verification`,

                    {},

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                // ==================================
                // UPDATE STATUS
                // ==================================

                setClaims(
                    (prev) =>
                        prev.map(
                            (item) => {

                                if (
                                    item._id ===
                                    verificationClaim._id
                                ) {

                                    return {

                                        ...item,

                                        status:
                                            "PHYSICAL_VERIFICATION",

                                    };

                                }


                                return item;

                            }
                        )
                );


                closeVerificationModal();

            } catch (err) {

                console.error(
                    "PHYSICAL VERIFICATION ERROR:",
                    err?.response?.data ||
                    err
                );


                if (
                    handleUnauthorized(
                        err
                    )
                ) {

                    return;

                }


                setError(
                    err?.response?.data
                        ?.message ||
                    "Failed to start physical verification."
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // OPEN PHYSICAL REJECT MODAL
    // ==========================================

    const openPhysicalRejectModal =
        (
            claim
        ) => {

            setPhysicalRejectClaimData(
                claim
            );

            setPhysicalRejectReason(
                ""
            );

            setShowPhysicalRejectModal(
                true
            );

        };


    // ==========================================
    // CLOSE PHYSICAL REJECT MODAL
    // ==========================================

    const closePhysicalRejectModal =
        () => {

            setPhysicalRejectClaimData(
                null
            );

            setPhysicalRejectReason(
                ""
            );

            setShowPhysicalRejectModal(
                false
            );

        };


    // ==========================================
    // CONFIRM PHYSICAL REJECT
    // ==========================================

    const confirmPhysicalReject =
        async () => {

            if (
                !physicalRejectClaimData?._id
            ) {

                return;

            }


            const reason =
                physicalRejectReason.trim();


            if (!reason) {

                setError(
                    "Rejection reason is required."
                );

                return;

            }


            try {

                setProcessingId(
                    physicalRejectClaimData._id
                );

                setError("");


                await axios.patch(

                    `${API_URL}/api/claims/${physicalRejectClaimData._id}/physical-reject`,

                    {
                        reason,
                    },

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                // ==================================
                // KEEP REJECTED CLAIM IN THE LIST
                // ==================================
                setClaims(
                    (prev) =>
                        prev.map(
                            (item) => {

                                if (
                                    item._id ===
                                    physicalRejectClaimData._id
                                ) {

                                    return {
                                        ...item,
                                        status:
                                            "REJECTED",
                                        rejectionReason:
                                            reason,
                                    };

                                }

                                return item;

                            }
                        )
                );


                closePhysicalRejectModal();


                closeDetails();

            } catch (err) {

                console.error(
                    "PHYSICAL REJECT ERROR:",
                    err?.response?.data ||
                    err
                );


                if (
                    handleUnauthorized(
                        err
                    )
                ) {

                    return;

                }


                setError(
                    err?.response?.data
                        ?.message ||
                    "Failed to reject claim."
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // OPEN REFOUNDED MODAL
    // ==========================================

    const openCompleteModal =
        (
            claim
        ) => {

            setCompleteClaimData(
                claim
            );

            setResponsibleDocument(
                null
            );

            setResponsibleStudentIdCard(
                null
            );

            setCompleteRemark(
                ""
            );

            setResponsibleDocumentPreview(
                ""
            );

            setStudentIdPreview(
                ""
            );

            setShowCompleteModal(
                true
            );

        };


    // ==========================================
    // CLOSE REFOUNDED MODAL
    // ==========================================

    const closeCompleteModal =
        () => {

            setCompleteClaimData(
                null
            );

            setResponsibleDocument(
                null
            );

            setResponsibleStudentIdCard(
                null
            );

            setCompleteRemark(
                ""
            );

            setResponsibleDocumentPreview(
                ""
            );

            setStudentIdPreview(
                ""
            );

            setShowCompleteModal(
                false
            );

        };


    // ==========================================
    // HANDLE IMAGE FILE
    // ==========================================

    const handleImageFile =
        (
            file,
            setter,
            previewSetter
        ) => {

            if (!file) {

                return;

            }


            const allowedTypes = [

                "image/jpeg",

                "image/jpg",

                "image/png",

                "image/webp",

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
                );

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                setError(
                    "Image size must be less than 5MB."
                );

                return;

            }


            setter(
                file
            );


            previewSetter(
                URL.createObjectURL(
                    file
                )
            );

            setError("");

        };


    // ==========================================
    // CONFIRM REFOUNDED
    // ==========================================

    const confirmComplete =
        async () => {

            if (
                !completeClaimData?._id
            ) {

                return;

            }


            if (
                !responsibleDocument
            ) {

                setError(
                    "Responsible verification document is required."
                );

                return;

            }


            if (
                !responsibleStudentIdCard
            ) {

                setError(
                    "Responsible person's student ID card is required."
                );

                return;

            }


            try {

                setProcessingId(
                    completeClaimData._id
                );

                setError("");


                const formData =
                    new FormData();


                formData.append(

                    "responsibleDocument",

                    responsibleDocument

                );


                formData.append(

                    "responsibleStudentIdCard",

                    responsibleStudentIdCard

                );


                formData.append(

                    "remark",

                    completeRemark.trim()

                );


                await axios.patch(

                    `${API_URL}/api/claims/${completeClaimData._id}/complete`,

                    formData,

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                        },

                    }

                );


                // ==================================
                // REMOVE COMPLETED CLAIM
                // ==================================

                setClaims(
                    (prev) =>
                        prev.filter(
                            (item) =>
                                item._id !==
                                completeClaimData._id
                        )
                );


                closeCompleteModal();


                closeDetails();

            } catch (err) {

                console.error(
                    "REFOUNDED ERROR:",
                    err?.response?.data ||
                    err
                );


                if (
                    handleUnauthorized(
                        err
                    )
                ) {

                    return;

                }


                setError(
                    err?.response?.data
                        ?.message ||
                    "Failed to complete/refound claim."
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // STATUS BADGE
    // ==========================================

    const getStatusBadge =
        (
            status
        ) => {

            if (
                status ===
                "PENDING"
            ) {

                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">

                        <FiClock />

                        Pending Review

                    </span>
                );

            }


            if (
                status ===
                "INITIAL_APPROVED"
            ) {

                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">

                        <FiCheckCircle />

                        Approved

                    </span>
                );

            }


            if (
                status ===
                "PHYSICAL_VERIFICATION"
            ) {

                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-600">

                        <FiShield />

                        Physical Verification

                    </span>
                );

            }


            if (
                status ===
                "INITIAL_REJECTED"
            ) {

                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                        <FiXCircle />
                        Initially Rejected
                    </span>
                );

            }


            if (
                status ===
                "REJECTED"
            ) {

                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                        <FiXCircle />
                        Rejected
                    </span>
                );

            }


            return null;

        };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 px-4 py-10">

                <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="text-sm font-medium text-slate-600">

                            Loading claim requests...

                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (
        error &&
        claims.length === 0
    ) {

        return (

            <div className="min-h-screen bg-slate-50 px-4 py-10">

                <div className="mx-auto max-w-6xl">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
                    >

                        <FiArrowLeft />

                        Back

                    </button>


                    <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

                            <FiAlertCircle
                                size={30}
                            />

                        </div>


                        <h2 className="text-xl font-bold text-slate-800">

                            Unable to Load Claims

                        </h2>


                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

                            {error}

                        </p>


                        <button
                            type="button"
                            onClick={
                                fetchClaims
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >

                            <FiRefreshCw />

                            Try Again

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // MAIN
    // ==========================================

    return (

        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-10">

            <div className="mx-auto max-w-6xl">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                    <div>

                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">

                            <MdOutlineRateReview />

                            Claim Management

                        </div>


                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                            Claim Requests

                        </h1>


                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                            Review claims, approve ownership,
                            perform physical verification and
                            complete the product return process.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            fetchClaims
                        }
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >

                        <FiRefreshCw />

                        Refresh

                    </button>

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                        <FiAlertCircle />

                        {error}

                    </div>

                )}


                {/* ==================================
                    EMPTY
                ================================== */}

                {claims.length === 0 ? (

                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-xl">

                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">

                            <FiCheckCircle
                                size={38}
                            />

                        </div>


                        <h2 className="text-xl font-bold text-slate-800">

                            No Claim Requests

                        </h2>


                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                            There are currently no claim requests.
                            Completed/refunded claims are removed from this page.

                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {claims.map(
                            (
                                claim,
                                index
                            ) => {

                                const post =
                                    getPost(
                                        claim
                                    );


                                const postImage =
                                    post?.images
                                        ?.length
                                        ? getImageUrl(
                                            post.images[0]
                                        )
                                        : "";


                                const claimer =
                                    claim?.claimerId;


                                return (

                                    <div
                                        key={
                                            claim?._id ||
                                            index
                                        }
                                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40"
                                    >

                                        {/* ==================================
                                            HEADER
                                        ================================== */}

                                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                    <FiPackage />

                                                </div>


                                                <div>

                                                    <p className="text-xs text-slate-400">

                                                        Claim submitted

                                                    </p>


                                                    <p className="text-sm font-semibold text-slate-700">

                                                        {formatDate(
                                                            claim?.createdAt
                                                        )}

                                                    </p>

                                                </div>

                                            </div>


                                            {getStatusBadge(
                                                claim?.status
                                            )}

                                        </div>


                                        {/* ==================================
                                            CONTENT
                                        ================================== */}

                                        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[220px_1fr]">

                                            {/* ==================================
                                                PRODUCT
                                            ================================== */}

                                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                                                {postImage ? (

                                                    <img
                                                        src={
                                                            postImage
                                                        }
                                                        alt="Found item"
                                                        className="h-56 w-full object-contain"
                                                    />

                                                ) : (

                                                    <div className="flex h-56 items-center justify-center text-slate-400">

                                                        <FiPackage
                                                            size={40}
                                                        />

                                                    </div>

                                                )}

                                            </div>


                                            {/* ==================================
                                                DETAILS
                                            ================================== */}

                                            <div>

                                                <div className="mb-5">

                                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">

                                                        Found Item

                                                    </p>


                                                    <p className="text-sm leading-6 text-slate-700">

                                                        {post?.description ||
                                                            "No description available."}

                                                    </p>

                                                </div>


                                                {/* ==================================
                                                    CLAIMANT
                                                ================================== */}

                                                <div className="mb-5 flex items-center gap-3">

                                                    {claimer?.picture ? (

                                                        <img
                                                            src={
                                                                getImageUrl(
                                                                    claimer.picture
                                                                )
                                                            }
                                                            alt={
                                                                claimer?.name ||
                                                                "Claimant"
                                                            }
                                                            className="h-11 w-11 rounded-full object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                                                            <FiUser />

                                                        </div>

                                                    )}


                                                    <div>

                                                        <p className="text-xs text-slate-400">

                                                            Claimant

                                                        </p>


                                                        <p className="text-sm font-semibold text-slate-800">

                                                            {claimer?.name ||
                                                                "Unknown User"}

                                                        </p>


                                                        <p className="text-xs text-slate-500">

                                                            {claimer?.email ||
                                                                "No email"}

                                                        </p>

                                                    </div>

                                                </div>


                                                {/* ==================================
                                                    DOCUMENTS
                                                ================================== */}

                                                <div className="grid gap-3 sm:grid-cols-2">

                                                    {/* CLAIMANT IMAGE */}

                                                    <div className="rounded-2xl border border-slate-200 p-3">

                                                        <div className="mb-2 flex items-center gap-2">

                                                            <FiUser className="text-blue-600" />

                                                            <p className="text-xs font-semibold text-slate-700">

                                                                Claimant Image

                                                            </p>

                                                        </div>


                                                        {claim?.claimerImage ? (

                                                            <img
                                                                src={
                                                                    getImageUrl(
                                                                        claim.claimerImage
                                                                    )
                                                                }
                                                                alt="Claimant"
                                                                className="h-32 w-full rounded-xl bg-slate-100 object-contain"
                                                            />

                                                        ) : (

                                                            <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">

                                                                Not available

                                                            </div>

                                                        )}

                                                    </div>


                                                    {/* PROOF */}

                                                    <div className="rounded-2xl border border-slate-200 p-3">

                                                        <div className="mb-2 flex items-center gap-2">

                                                            <FiFileText className="text-blue-600" />

                                                            <p className="text-xs font-semibold text-slate-700">

                                                                Proof Document

                                                            </p>

                                                        </div>


                                                        {claim?.proofDocument ? (

                                                            <img
                                                                src={
                                                                    getImageUrl(
                                                                        claim.proofDocument
                                                                    )
                                                                }
                                                                alt="Proof"
                                                                className="h-32 w-full rounded-xl bg-slate-100 object-contain"
                                                            />

                                                        ) : (

                                                            <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">

                                                                Not available

                                                            </div>

                                                        )}

                                                    </div>

                                                </div>


                                                {/* ==================================
                                                    ACTIONS
                                                ================================== */}

                                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDetails(
                                                                claim
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                    >

                                                        <FiEye />

                                                        View Details

                                                    </button>


                                                    {/* ==================================
                                                        PENDING ACTIONS
                                                    ================================== */}

                                                    {(claim?.status ===
                                                        "PENDING" ||
                                                        claim?.status ===
                                                        "INITIAL_REJECTED") &&
                                                        isResponsible && (
                                                            <>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processingId ===
                                                                        claim?._id
                                                                    }
                                                                    onClick={() =>
                                                                        openApproveModal(
                                                                            claim
                                                                        )
                                                                    }
                                                                    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >

                                                                    <FiCheckCircle />

                                                                    {claim?.status ===
                                                                    "INITIAL_REJECTED"
                                                                        ? "Approve Again"
                                                                        : "Approve"}

                                                                </button>


                                                                {claim?.status ===
                                                                    "PENDING" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processingId ===
                                                                        claim?._id
                                                                    }
                                                                    onClick={() =>
                                                                        openRejectModal(
                                                                            claim
                                                                        )
                                                                    }
                                                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >

                                                                    <FiXCircle />

                                                                    Reject

                                                                </button>
                                                                )}

                                                            </>
                                                        )}


                                                    {/* ==================================
                                                        INITIAL APPROVED
                                                    ================================== */}

                                                    {claim?.status ===
                                                        "INITIAL_APPROVED" &&
                                                        isResponsible && (

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processingId ===
                                                                    claim?._id
                                                                }
                                                                onClick={() =>
                                                                    openVerificationModal(
                                                                        claim
                                                                    )
                                                                }
                                                                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >

                                                                <FiPlayCircle />

                                                                Start Physical Verification

                                                            </button>

                                                        )}


                                                    {/* ==================================
                                                        PHYSICAL VERIFICATION
                                                    ================================== */}

                                                    {claim?.status ===
                                                        "PHYSICAL_VERIFICATION" &&
                                                        (isResponsible || isAdmin) && (

                                                            <>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processingId ===
                                                                        claim?._id
                                                                    }
                                                                    onClick={() =>
                                                                        openCompleteModal(
                                                                            claim
                                                                        )
                                                                    }
                                                                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >

                                                                    <FiCheckCircle />

                                                                    Refounded Successfully

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processingId ===
                                                                        claim?._id
                                                                    }
                                                                    onClick={() =>
                                                                        openPhysicalRejectModal(
                                                                            claim
                                                                        )
                                                                    }
                                                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >

                                                                    <FiXCircle />

                                                                    Reject

                                                                </button>

                                                            </>

                                                        )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* ============================================================
                DETAILS MODAL
            ============================================================ */}

            {showDetails &&
                selectedClaim && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4"
                        onClick={
                            closeDetails
                        }
                    >

                        <div
                            className="my-8 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">

                                        Claim Details

                                    </p>


                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">

                                        {selectedClaim?.claimerId?.name ||
                                            "Claim Request"}

                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeDetails
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >

                                    <FiX />

                                </button>

                            </div>


                            <div className="mt-6 grid gap-5 sm:grid-cols-2">

                                <div className="rounded-2xl border border-slate-200 p-4">

                                    <p className="text-xs text-slate-400">

                                        Status

                                    </p>


                                    <div className="mt-2">

                                        {getStatusBadge(
                                            selectedClaim?.status
                                        )}

                                    </div>

                                </div>


                                <div className="rounded-2xl border border-slate-200 p-4">

                                    <p className="text-xs text-slate-400">

                                        Submitted

                                    </p>


                                    <p className="mt-2 text-sm font-semibold text-slate-700">

                                        {formatDate(
                                            selectedClaim?.createdAt
                                        )}

                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">

                                    Claimant

                                </p>


                                <div className="flex items-center gap-4">

                                    {selectedClaim?.claimerId?.picture ? (

                                        <img
                                            src={
                                                getImageUrl(
                                                    selectedClaim.claimerId.picture
                                                )
                                            }
                                            alt="Claimant"
                                            className="h-16 w-16 rounded-2xl object-cover"
                                        />

                                    ) : (

                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                                            <FiUser
                                                size={24}
                                            />

                                        </div>

                                    )}


                                    <div>

                                        <p className="font-semibold text-slate-800">

                                            {selectedClaim?.claimerId?.name ||
                                                "Unknown User"}

                                        </p>


                                        <p className="text-sm text-slate-500">

                                            {selectedClaim?.claimerId?.email ||
                                                "No email"}

                                        </p>


                                        <p className="text-sm text-slate-500">

                                            {selectedClaim?.claimerId?.phone ||
                                                "No phone"}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">

                                    Found Product

                                </p>


                                <p className="text-sm leading-6 text-slate-700">

                                    {getPost(
                                        selectedClaim
                                    )?.description ||
                                        "No description available."}

                                </p>

                            </div>


                            <div className="mt-5 grid gap-4 sm:grid-cols-2">

                                <div className="rounded-2xl border border-slate-200 p-4">

                                    <p className="mb-3 text-xs font-semibold text-slate-600">

                                        Claimant Image

                                    </p>


                                    {selectedClaim?.claimerImage ? (

                                        <img
                                            src={
                                                getImageUrl(
                                                    selectedClaim.claimerImage
                                                )
                                            }
                                            alt="Claimant"
                                            className="h-56 w-full rounded-xl bg-slate-100 object-contain"
                                        />

                                    ) : (

                                        <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">

                                            Not available

                                        </div>

                                    )}

                                </div>


                                <div className="rounded-2xl border border-slate-200 p-4">

                                    <p className="mb-3 text-xs font-semibold text-slate-600">

                                        Proof Document

                                    </p>


                                    {selectedClaim?.proofDocument ? (

                                        <img
                                            src={
                                                getImageUrl(
                                                    selectedClaim.proofDocument
                                                )
                                            }
                                            alt="Proof"
                                            className="h-56 w-full rounded-xl bg-slate-100 object-contain"
                                        />

                                    ) : (

                                        <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">

                                            Not available

                                        </div>

                                    )}

                                </div>

                            </div>


                            {selectedClaim?.initialRemark && (

                                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                                    <p className="text-xs font-semibold text-blue-600">

                                        Approval Remark

                                    </p>


                                    <p className="mt-2 text-sm leading-6 text-blue-900">

                                        {selectedClaim.initialRemark}

                                    </p>

                                </div>

                            )}


                        </div>

                    </div>

                )}


            {/* ============================================================
                APPROVE MODAL
            ============================================================ */}

            {showApproveModal &&
                approveClaim && (

                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">

                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                                        <FiCheckCircle
                                            size={24}
                                        />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">

                                            Approve Claim

                                        </h2>


                                        <p className="text-xs text-slate-500">

                                            Initial claim approval

                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeApproveModal
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >

                                    <FiX />

                                </button>

                            </div>


                            <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4">

                                <p className="text-sm leading-6 text-green-800">

                                    Are you sure you want to approve
                                    this claim?

                                </p>


                                <p className="mt-2 text-xs leading-5 text-green-700">

                                    The claimant will receive an
                                    approval email and the claim
                                    will move to physical verification.

                                </p>

                            </div>


                            <div className="mt-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-800">

                                    Approval Remark

                                    <span className="ml-1 font-normal text-slate-400">

                                        (Optional)

                                    </span>

                                </label>


                                <textarea
                                    value={
                                        approveRemark
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setApproveRemark(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Write an approval remark..."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                                />

                            </div>


                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={
                                        closeApproveModal
                                    }
                                    disabled={
                                        processingId ===
                                        approveClaim?._id
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        confirmApprove
                                    }
                                    disabled={
                                        processingId ===
                                        approveClaim?._id
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processingId ===
                                        approveClaim?._id ? (

                                        <>

                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                            Approving...

                                        </>

                                    ) : (

                                        <>

                                            <FiCheckCircle />

                                            Confirm Approval

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* ============================================================
                INITIAL REJECT MODAL
            ============================================================ */}

            {showRejectModal &&
                rejectClaim && (

                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">

                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">

                                        <FiXCircle
                                            size={24}
                                        />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">

                                            Reject Claim

                                        </h2>


                                        <p className="text-xs text-slate-500">

                                            Initial claim rejection

                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeRejectModal
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >

                                    <FiX />

                                </button>

                            </div>


                            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">

                                <p className="text-sm leading-6 text-red-800">

                                    Are you sure you want to reject
                                    this claim?

                                </p>


                                <p className="mt-2 text-xs leading-5 text-red-700">

                                    The claimant will receive a
                                    rejection email with the reason.

                                </p>

                            </div>


                            <div className="mt-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-800">

                                    Rejection Reason

                                    <span className="ml-1 text-red-500">

                                        *

                                    </span>

                                </label>


                                <textarea
                                    value={
                                        rejectReason
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setRejectReason(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Explain why this claim is being rejected..."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
                                />

                            </div>


                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={
                                        closeRejectModal
                                    }
                                    disabled={
                                        processingId ===
                                        rejectClaim?._id
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        confirmReject
                                    }
                                    disabled={
                                        !rejectReason.trim() ||
                                        processingId ===
                                        rejectClaim?._id
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processingId ===
                                        rejectClaim?._id ? (

                                        <>

                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                            Rejecting...

                                        </>

                                    ) : (

                                        <>

                                            <FiXCircle />

                                            Confirm Rejection

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* ============================================================
                START PHYSICAL VERIFICATION MODAL
            ============================================================ */}

            {showVerificationModal &&
                verificationClaim && (

                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">

                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">

                                        <FiShield
                                            size={24}
                                        />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">

                                            Physical Verification

                                        </h2>


                                        <p className="text-xs text-slate-500">

                                            Start product verification

                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeVerificationModal
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >

                                    <FiX />

                                </button>

                            </div>


                            <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50 p-5">

                                <p className="text-sm leading-6 text-purple-900">

                                    You are about to start the
                                    physical verification process
                                    for this claimant.

                                </p>


                                <div className="mt-4 space-y-2 text-xs text-purple-800">

                                    <p>

                                        • Check the claimant's
                                        ownership evidence.

                                    </p>

                                    <p>

                                        • Physically verify the
                                        found product.

                                    </p>

                                    <p>

                                        • Verify the claimant's
                                        identity before completing
                                        the return.

                                    </p>

                                </div>

                            </div>


                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={
                                        closeVerificationModal
                                    }
                                    disabled={
                                        processingId ===
                                        verificationClaim?._id
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        confirmPhysicalVerification
                                    }
                                    disabled={
                                        processingId ===
                                        verificationClaim?._id
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processingId ===
                                        verificationClaim?._id ? (

                                        <>

                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                            Starting...

                                        </>

                                    ) : (

                                        <>

                                            <FiPlayCircle />

                                            Start Verification

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* ============================================================
                PHYSICAL REJECT MODAL
            ============================================================ */}

            {showPhysicalRejectModal &&
                physicalRejectClaimData && (

                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4">

                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">

                                        <FiXCircle
                                            size={24}
                                        />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">

                                            Reject After Verification

                                        </h2>


                                        <p className="text-xs text-slate-500">

                                            Physical verification rejection

                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closePhysicalRejectModal
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >

                                    <FiX />

                                </button>

                            </div>


                            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">

                                <p className="text-sm leading-6 text-red-800">

                                    Are you sure you want to reject
                                    this claim after physical
                                    verification?

                                </p>


                                <p className="mt-2 text-xs leading-5 text-red-700">

                                    The claimant will receive an email
                                    explaining the rejection reason.

                                </p>

                            </div>


                            <div className="mt-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-800">

                                    Rejection Reason

                                    <span className="ml-1 text-red-500">

                                        *

                                    </span>

                                </label>


                                <textarea
                                    value={
                                        physicalRejectReason
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setPhysicalRejectReason(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Explain why the claim failed physical verification..."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
                                />

                            </div>


                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={
                                        closePhysicalRejectModal
                                    }
                                    disabled={
                                        processingId ===
                                        physicalRejectClaimData?._id
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        confirmPhysicalReject
                                    }
                                    disabled={
                                        !physicalRejectReason.trim() ||
                                        processingId ===
                                        physicalRejectClaimData?._id
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processingId ===
                                        physicalRejectClaimData?._id ? (

                                        <>

                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                            Rejecting...

                                        </>

                                    ) : (

                                        <>

                                            <FiXCircle />

                                            Confirm Rejection

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* ============================================================
                REFOUNDED / COMPLETE MODAL
            ============================================================ */}

            {showCompleteModal &&
                completeClaimData && (

                    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">

                        <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                                        <FiCheckCircle
                                            size={24}
                                        />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">

                                            Refounded Successfully

                                        </h2>


                                        <p className="text-xs text-slate-500">

                                            Complete physical verification

                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeCompleteModal
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >

                                    <FiX />

                                </button>

                            </div>


                            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                                <p className="text-sm leading-6 text-emerald-800">

                                    Confirm that the product has
                                    been physically verified and
                                    returned to the claimant.

                                </p>

                            </div>


                            {/* ======================================
                                RESPONSIBLE DOCUMENT
                            ====================================== */}

                            <div className="mt-6">

                                <label className="mb-2 block text-sm font-semibold text-slate-800">

                                    Responsible Verification Document

                                    <span className="ml-1 text-red-500">

                                        *

                                    </span>

                                </label>


                                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50">

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(
                                            e
                                        ) =>
                                            handleImageFile(
                                                e.target.files?.[0],
                                                setResponsibleDocument,
                                                setResponsibleDocumentPreview
                                            )
                                        }
                                    />


                                    {responsibleDocumentPreview ? (

                                        <img
                                            src={
                                                responsibleDocumentPreview
                                            }
                                            alt="Verification document"
                                            className="mx-auto h-48 w-full rounded-xl object-contain"
                                        />

                                    ) : (

                                        <>

                                            <FiUpload
                                                size={28}
                                                className="mx-auto mb-2 text-slate-400"
                                            />


                                            <p className="text-sm font-semibold text-slate-700">

                                                Upload verification document

                                            </p>


                                            <p className="mt-1 text-xs text-slate-400">

                                                JPG, JPEG, PNG or WEBP • Max 5MB

                                            </p>

                                        </>

                                    )}

                                </label>

                            </div>


                            {/* ======================================
                                STUDENT ID
                            ====================================== */}

                            <div className="mt-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-800">

                                    Responsible Person Student ID Card

                                    <span className="ml-1 text-red-500">

                                        *

                                    </span>

                                </label>


                                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50">

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(
                                            e
                                        ) =>
                                            handleImageFile(
                                                e.target.files?.[0],
                                                setResponsibleStudentIdCard,
                                                setStudentIdPreview
                                            )
                                        }
                                    />


                                    {studentIdPreview ? (

                                        <img
                                            src={
                                                studentIdPreview
                                            }
                                            alt="Student ID"
                                            className="mx-auto h-48 w-full rounded-xl object-contain"
                                        />

                                    ) : (

                                        <>

                                            <FiUpload
                                                size={28}
                                                className="mx-auto mb-2 text-slate-400"
                                            />


                                            <p className="text-sm font-semibold text-slate-700">

                                                Upload student ID card

                                            </p>


                                            <p className="mt-1 text-xs text-slate-400">

                                                JPG, JPEG, PNG or WEBP • Max 5MB

                                            </p>

                                        </>

                                    )}

                                </label>

                            </div>


                            {/* ======================================
                                REMARK
                            ====================================== */}

                            <div className="mt-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-800">

                                    Verification Remark

                                    <span className="ml-1 font-normal text-slate-400">

                                        (Optional)

                                    </span>

                                </label>


                                <textarea
                                    value={
                                        completeRemark
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCompleteRemark(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Write physical verification details..."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                                />

                            </div>


                            {/* ======================================
                                ACTIONS
                            ====================================== */}

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={
                                        closeCompleteModal
                                    }
                                    disabled={
                                        processingId ===
                                        completeClaimData?._id
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        confirmComplete
                                    }
                                    disabled={
                                        !responsibleDocument ||
                                        !responsibleStudentIdCard ||
                                        processingId ===
                                        completeClaimData?._id
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processingId ===
                                        completeClaimData?._id ? (

                                        <>

                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                            Completing...

                                        </>

                                    ) : (

                                        <>

                                            <FiCheckCircle />

                                            Confirm Refounded

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>

    );

};


export default ClaimReques;
