import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import axios from "axios";

import {
    FaArrowUp,
    FaBoxOpen,
    FaMapMarkerAlt,
    FaRegCommentDots,
    FaRobot,
    FaTimes,
} from "react-icons/fa";

const API_URL = "http://localhost:3000";


// ==================================================
// AI CHATBOT
// ==================================================

const AIChatbot = () => {

    const [isOpen, setIsOpen] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [messages, setMessages] =
        useState([
            {
                id: 1,
                type: "bot",
                text:
                    "Hi! I’m here to help you find something you’ve lost.",
            },
            {
                id: 2,
                type: "bot",
                text:
                    "Tell me what you lost. You can mention the brand, color, model, or where you last saw it.",
            },
        ]);


    const messagesEndRef =
        useRef(null);

    const inputRef =
        useRef(null);


    // ==================================================
    // AUTO SCROLL
    // ==================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [
        messages,
        loading,
    ]);


    // ==================================================
    // FOCUS INPUT
    // ==================================================

    useEffect(() => {

        if (isOpen) {

            setTimeout(() => {
                inputRef.current?.focus();
            }, 150);

        }

    }, [isOpen]);


    // ==================================================
    // ADD MESSAGE
    // ==================================================

    const addMessage = (
        type,
        text,
        matches = []
    ) => {

        setMessages((previous) => [

            ...previous,

            {
                id:
                    Date.now() +
                    Math.random(),

                type,

                text,

                matches,
            },

        ]);

    };


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    const handleSend = async () => {

        const text =
            message.trim();


        if (
            !text ||
            loading
        ) {
            return;
        }


        // User message

        addMessage(
            "user",
            text
        );

        setMessage("");

        setLoading(true);


        try {

            const token =
                localStorage.getItem(
                    "findback_token"
                );


            const response =
                await axios.post(

                    `${API_URL}/api/ai/match`,

                    {
                        description:
                            text,
                    },

                    {
                        headers: token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`,
                              }
                            : {},
                    }

                );


            const data =
                response.data;


            if (
                data?.success
            ) {

                const matches =
                    data?.data?.matches ||
                    [];


                if (
                    matches.length > 0
                ) {

                    addMessage(

                        "bot",

                        matches.length === 1
                            ? "I found something that may be your item."
                            : `I found ${matches.length} possible matches.`,

                        matches

                    );

                } else {

                    addMessage(

                        "bot",

                        "I couldn't find a close match yet. Try telling me the brand, color, model, or the place where you lost it."

                    );

                }

            } else {

                addMessage(

                    "bot",

                    data?.message ||
                        "I couldn't search for your item right now."

                );

            }

        } catch (error) {

            console.error(
                "AI chatbot error:",
                error
            );


            addMessage(

                "bot",

                error?.response?.data?.message ||
                    "I’m having trouble connecting right now. Please try again."

            );

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // ENTER KEY
    // ==================================================

    const handleKeyDown = (
        event
    ) => {

        if (
            event.key ===
                "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    // ==================================================
    // SUGGESTION
    // ==================================================

    const useSuggestion = (
        text
    ) => {

        setMessage(text);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

    };


    // ==================================================
    // IMAGE URL
    // ==================================================

    const getImageUrl = (
        image
    ) => {

        if (!image) {
            return null;
        }


        if (
            typeof image ===
            "object"
        ) {

            image =
                image.url ||
                image.path ||
                image.filename ||
                image.fileName;

        }


        if (!image) {
            return null;
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


        if (
            image.startsWith("/")
        ) {

            return `${API_URL}${image}`;

        }


        return `${API_URL}/uploads/${image}`;

    };


    // ==================================================
    // SCORE
    // ==================================================

    const getScore = (
        post
    ) => {

        return Math.round(
            Number(
                post?.matchScore ??
                    post?.score ??
                    0
            )
        );

    };


    // ==================================================
    // SCORE LABEL
    // ==================================================

    const getScoreLabel = (
        score
    ) => {

        if (
            score >= 85
        ) {
            return "Very likely";
        }

        if (
            score >= 70
        ) {
            return "Likely match";
        }

        if (
            score >= 50
        ) {
            return "Possible match";
        }

        return "Worth checking";

    };


    // ==================================================
    // VIEW POST
    // ==================================================

    const handleViewPost = (
        post
    ) => {

        if (
            !post?._id
        ) {
            return;
        }


        window.location.href =
            `/post/${post._id}`;

    };


    return (

        <>

            {/* ==================================================
                FLOATING BUTTON
            ================================================== */}

            {!isOpen && (

                <button

                    onClick={() =>
                        setIsOpen(true)
                    }

                    className="
                        fixed
                        right-6
                        bottom-6
                        z-[100]
                        group
                    "

                    aria-label="FindBack assistant"

                >

                    {/* Tooltip */}

                    <div
                        className="
                            absolute
                            right-0
                            bottom-[72px]
                            whitespace-nowrap
                            rounded-xl
                            bg-gray-900
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            opacity-0
                            translate-y-1
                            pointer-events-none
                            group-hover:opacity-100
                            group-hover:translate-y-0
                            transition
                        "
                    >
                        Need help finding something?
                    </div>


                    <div
                        className="
                            relative
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            border
                            border-gray-200
                            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                            transition
                            duration-200
                            group-hover:-translate-y-1
                            group-hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                        "
                    >

                        <FaRegCommentDots
                            className="
                                text-[22px]
                                text-gray-900
                            "
                        />

                        {/* Online dot */}

                        <span
                            className="
                                absolute
                                right-1
                                top-1
                                h-3
                                w-3
                                rounded-full
                                bg-green-500
                                border-2
                                border-white
                            "
                        />

                    </div>

                </button>

            )}


            {/* ==================================================
                CHAT WINDOW
            ================================================== */}

            {isOpen && (

                <div
                    className="
                        fixed
                        right-5
                        bottom-5
                        z-[100]
                        flex
                        h-[min(680px,calc(100vh-40px))]
                        w-[min(410px,calc(100vw-40px))]
                        flex-col
                        overflow-hidden
                        rounded-[28px]
                        border
                        border-gray-200
                        bg-white
                        shadow-[0_20px_70px_rgba(0,0,0,0.16)]
                    "
                >


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div
                        className="
                            shrink-0
                            border-b
                            border-gray-100
                            bg-white
                            px-5
                            py-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
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
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-gray-100
                                    "
                                >

                                    <FaRobot
                                        className="
                                            text-lg
                                            text-gray-800
                                        "
                                    />

                                </div>


                                <div>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <h3
                                            className="
                                                text-sm
                                                font-bold
                                                text-gray-900
                                            "
                                        >
                                            FindBack Assistant
                                        </h3>

                                        <span
                                            className="
                                                rounded-full
                                                bg-green-50
                                                px-2
                                                py-0.5
                                                text-[9px]
                                                font-semibold
                                                text-green-600
                                            "
                                        >
                                            ONLINE
                                        </span>

                                    </div>


                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        Helping people reconnect with lost things
                                    </p>

                                </div>

                            </div>


                            <button

                                onClick={() =>
                                    setIsOpen(false)
                                }

                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-gray-400
                                    hover:bg-gray-100
                                    hover:text-gray-900
                                    transition
                                "

                                aria-label="Close chatbot"

                            >

                                <FaTimes />

                            </button>

                        </div>

                    </div>


                    {/* ==================================================
                        CHAT AREA
                    ================================================== */}

                    <div
                        className="
                            flex-1
                            overflow-y-auto
                            bg-[#fafafa]
                            px-4
                            py-5
                        "
                    >

                        {messages.map(
                            (item) => (

                                <div
                                    key={item.id}
                                    className={`
                                        mb-5
                                        flex
                                        ${
                                            item.type === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }
                                    `}
                                >

                                    {item.type === "bot" ? (

                                        <div
                                            className="
                                                w-full
                                                max-w-[94%]
                                            "
                                        >

                                            {/* Bot message */}

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    gap-2
                                                "
                                            >

                                                <div
                                                    className="
                                                        mt-1
                                                        flex
                                                        h-7
                                                        w-7
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        bg-gray-900
                                                        text-white
                                                    "
                                                >

                                                    <FaRobot
                                                        className="
                                                            text-[10px]
                                                        "
                                                    />

                                                </div>


                                                <div
                                                    className="
                                                        rounded-2xl
                                                        rounded-tl-md
                                                        bg-white
                                                        px-4
                                                        py-3
                                                        text-[13px]
                                                        leading-5
                                                        text-gray-700
                                                        shadow-sm
                                                        border
                                                        border-gray-100
                                                    "
                                                >
                                                    {item.text}
                                                </div>

                                            </div>


                                            {/* Match cards */}

                                            {item.matches?.length >
                                                0 && (

                                                <div
                                                    className="
                                                        mt-3
                                                        ml-9
                                                        space-y-3
                                                    "
                                                >

                                                    {item.matches.map(
                                                        (
                                                            post,
                                                            index
                                                        ) => {

                                                            const image =
                                                                getImageUrl(
                                                                    post?.images?.[0]
                                                                );

                                                            const score =
                                                                getScore(
                                                                    post
                                                                );


                                                            return (

                                                                <div
                                                                    key={
                                                                        post?._id ||
                                                                        index
                                                                    }
                                                                    className="
                                                                        overflow-hidden
                                                                        rounded-2xl
                                                                        border
                                                                        border-gray-200
                                                                        bg-white
                                                                        shadow-sm
                                                                    "
                                                                >

                                                                    {/* Image */}

                                                                    <div
                                                                        className="
                                                                            relative
                                                                            h-40
                                                                            w-full
                                                                            bg-gray-100
                                                                        "
                                                                    >

                                                                        {image ? (

                                                                            <img
                                                                                src={
                                                                                    image
                                                                                }
                                                                                alt="Possible found item"
                                                                                className="
                                                                                    h-full
                                                                                    w-full
                                                                                    object-cover
                                                                                "
                                                                                onError={(
                                                                                    event
                                                                                ) => {

                                                                                    event.currentTarget.style.display =
                                                                                        "none";

                                                                                }}
                                                                            />

                                                                        ) : (

                                                                            <div
                                                                                className="
                                                                                    flex
                                                                                    h-full
                                                                                    items-center
                                                                                    justify-center
                                                                                    text-gray-300
                                                                                "
                                                                            >

                                                                                <FaBoxOpen
                                                                                    className="
                                                                                        text-4xl
                                                                                    "
                                                                                />

                                                                            </div>

                                                                        )}


                                                                        {/* Score */}

                                                                        <div
                                                                            className="
                                                                                absolute
                                                                                right-3
                                                                                top-3
                                                                                rounded-full
                                                                                bg-white
                                                                                px-3
                                                                                py-1.5
                                                                                shadow-sm
                                                                            "
                                                                        >

                                                                            <span
                                                                                className="
                                                                                    text-xs
                                                                                    font-bold
                                                                                    text-gray-900
                                                                                "
                                                                            >
                                                                                {score}%
                                                                            </span>

                                                                        </div>

                                                                    </div>


                                                                    {/* Card body */}

                                                                    <div
                                                                        className="
                                                                            p-4
                                                                        "
                                                                    >

                                                                        <div
                                                                            className="
                                                                                mb-2
                                                                                flex
                                                                                items-center
                                                                                justify-between
                                                                                gap-2
                                                                            "
                                                                        >

                                                                            <span
                                                                                className="
                                                                                    text-[10px]
                                                                                    font-bold
                                                                                    uppercase
                                                                                    tracking-wider
                                                                                    text-gray-400
                                                                                "
                                                                            >
                                                                                Possible match
                                                                            </span>


                                                                            <span
                                                                                className="
                                                                                    text-[10px]
                                                                                    font-semibold
                                                                                    text-gray-600
                                                                                "
                                                                            >
                                                                                {
                                                                                    getScoreLabel(
                                                                                        score
                                                                                    )
                                                                                }
                                                                            </span>

                                                                        </div>


                                                                        <p
                                                                            className="
                                                                                line-clamp-3
                                                                                text-sm
                                                                                font-semibold
                                                                                leading-5
                                                                                text-gray-900
                                                                            "
                                                                        >
                                                                            {
                                                                                post?.description ||
                                                                                "Found product"
                                                                            }
                                                                        </p>


                                                                        {post?.location && (

                                                                            <div
                                                                                className="
                                                                                    mt-2
                                                                                    flex
                                                                                    items-center
                                                                                    gap-1.5
                                                                                    text-xs
                                                                                    text-gray-500
                                                                                "
                                                                            >

                                                                                <FaMapMarkerAlt />

                                                                                <span>
                                                                                    {
                                                                                        typeof post.location ===
                                                                                        "string"
                                                                                            ? post.location
                                                                                            : post.location?.address ||
                                                                                              post.location?.area ||
                                                                                              "Location available"
                                                                                    }
                                                                                </span>

                                                                            </div>

                                                                        )}


                                                                        {/* AI reason */}

                                                                        {post?.reason && (

                                                                            <div
                                                                                className="
                                                                                    mt-3
                                                                                    rounded-xl
                                                                                    bg-gray-50
                                                                                    px-3
                                                                                    py-2.5
                                                                                "
                                                                            >

                                                                                <p
                                                                                    className="
                                                                                        text-[11px]
                                                                                        leading-4
                                                                                        text-gray-500
                                                                                    "
                                                                                >

                                                                                    <span
                                                                                        className="
                                                                                            font-semibold
                                                                                            text-gray-700
                                                                                        "
                                                                                    >
                                                                                        Why it may match:
                                                                                    </span>{" "}

                                                                                    {
                                                                                        post.reason
                                                                                    }

                                                                                </p>

                                                                            </div>

                                                                        )}


                                                                        <button

                                                                            onClick={() =>
                                                                                handleViewPost(
                                                                                    post
                                                                                )
                                                                            }

                                                                            className="
                                                                                mt-3
                                                                                w-full
                                                                                rounded-xl
                                                                                bg-gray-900
                                                                                px-4
                                                                                py-2.5
                                                                                text-xs
                                                                                font-semibold
                                                                                text-white
                                                                                transition
                                                                                hover:bg-gray-700
                                                                            "
                                                                        >
                                                                            View found post
                                                                        </button>

                                                                    </div>

                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    ) : (

                                        /* User message */

                                        <div
                                            className="
                                                max-w-[80%]
                                                rounded-2xl
                                                rounded-tr-md
                                                bg-gray-900
                                                px-4
                                                py-3
                                                text-[13px]
                                                leading-5
                                                text-white
                                            "
                                        >
                                            {item.text}
                                        </div>

                                    )}

                                </div>

                            )
                        )}


                        {/* ==================================================
                            LOADING
                        ================================================== */}

                        {loading && (

                            <div
                                className="
                                    mb-4
                                    flex
                                    items-start
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-gray-900
                                        text-white
                                    "
                                >
                                    <FaRobot
                                        className="text-[10px]"
                                    />
                                </div>


                                <div
                                    className="
                                        rounded-2xl
                                        rounded-tl-md
                                        border
                                        border-gray-100
                                        bg-white
                                        px-4
                                        py-3
                                        shadow-sm
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-1
                                        "
                                    >

                                        <span
                                            className="
                                                h-1.5
                                                w-1.5
                                                animate-bounce
                                                rounded-full
                                                bg-gray-400
                                            "
                                        />

                                        <span
                                            className="
                                                h-1.5
                                                w-1.5
                                                animate-bounce
                                                rounded-full
                                                bg-gray-400
                                                [animation-delay:150ms]
                                            "
                                        />

                                        <span
                                            className="
                                                h-1.5
                                                w-1.5
                                                animate-bounce
                                                rounded-full
                                                bg-gray-400
                                                [animation-delay:300ms]
                                            "
                                        />

                                    </div>

                                </div>

                            </div>

                        )}

                        <div
                            ref={messagesEndRef}
                        />

                    </div>


                    {/* ==================================================
                        SUGGESTIONS
                    ================================================== */}

                    <div
                        className="
                            shrink-0
                            border-t
                            border-gray-100
                            bg-white
                            px-4
                            pt-3
                        "
                    >

                        <div
                            className="
                                mb-3
                                flex
                                gap-2
                                overflow-x-auto
                                pb-1
                            "
                        >

                            {[
                                "I lost my phone",
                                "I lost a black wallet",
                                "I lost my watch",
                            ].map(
                                (suggestion) => (

                                    <button

                                        key={suggestion}

                                        onClick={() =>
                                            useSuggestion(
                                                suggestion
                                            )
                                        }

                                        className="
                                            shrink-0
                                            rounded-full
                                            border
                                            border-gray-200
                                            bg-white
                                            px-3
                                            py-1.5
                                            text-[11px]
                                            font-medium
                                            text-gray-600
                                            transition
                                            hover:border-gray-400
                                            hover:text-gray-900
                                        "
                                    >
                                        {suggestion}
                                    </button>

                                )
                            )}

                        </div>


                        {/* ==================================================
                            INPUT
                        ================================================== */}

                        <div
                            className="
                                mb-4
                                flex
                                items-end
                                gap-2
                                rounded-2xl
                                border
                                border-gray-200
                                bg-gray-50
                                p-2
                                transition
                                focus-within:border-gray-400
                                focus-within:bg-white
                            "
                        >

                            <textarea

                                ref={inputRef}

                                value={message}

                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }

                                onKeyDown={
                                    handleKeyDown
                                }

                                disabled={loading}

                                rows={1}

                                placeholder="Describe what you lost..."

                                className="
                                    max-h-24
                                    min-h-[40px]
                                    flex-1
                                    resize-none
                                    bg-transparent
                                    px-3
                                    py-2.5
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    placeholder:text-gray-400
                                "
                            />


                            <button

                                onClick={
                                    handleSend
                                }

                                disabled={
                                    !message.trim() ||
                                    loading
                                }

                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-gray-900
                                    text-white
                                    transition
                                    hover:bg-gray-700
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-200
                                    disabled:text-gray-400
                                "

                                aria-label="Send message"

                            >

                                <FaArrowUp
                                    className="text-sm"
                                />

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

};

export default AIChatbot;