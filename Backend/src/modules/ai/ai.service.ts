import { GoogleGenAI } from "@google/genai";
import { Types } from "mongoose";
import Post from "../Post/post.model.js";

// ==================================================
// GEMINI CLIENT
// ==================================================

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error(
        "GEMINI_API_KEY is not configured"
    );
}

const ai = new GoogleGenAI({
    apiKey,
});

// ==================================================
// TYPES
// ==================================================

interface ProductInfo {
    product: string;
    category: string;
    brand: string;
    model: string;
    color: string;
    material: string;
    location: string;
    date: string;
    time: string;
    distinctiveFeatures: string[];
    keywords: string[];
}

interface MatchResult {
    _id: string;
    postId: string;

    userId: any;

    postType: "FIND" | "LOST";

    description: string;

    images: string[];

    layout: string;

    status: string;

    likes?: any[];

    savedBy?: any[];

    comments?: any[];

    matchScore: number;

    reason: string;

    createdAt?: Date;

    updatedAt?: Date;
}

interface GeminiMatch {
    index: number;
    score: number;
    reason: string;
}

// ==================================================
// CONSTANTS
// ==================================================

const MAX_CANDIDATES = 50;

const MIN_MATCH_SCORE = 40;

// ==================================================
// SAFE JSON PARSER
// ==================================================

const parseJson = <T>(
    text: string,
    fallback: T
): T => {
    try {
        if (!text) {
            return fallback;
        }

        let clean = text.trim();

        clean = clean
            .replace(
                /^```json\s*/i,
                ""
            )
            .replace(
                /^```\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();

        return JSON.parse(clean) as T;
    } catch (error) {
        console.error(
            "JSON parse error:",
            error
        );

        return fallback;
    }
};

// ==================================================
// GEMINI REQUEST
// ==================================================

const generateGemini = async (
    contents: string,
    config: any
) => {
    const models = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
    ];

    let lastError: any = null;

    for (const model of models) {
        for (
            let attempt = 1;
            attempt <= 2;
            attempt++
        ) {
            try {
                console.log(
                    `Gemini request: ${model} | attempt ${attempt}`
                );

                const response =
                    await ai.models.generateContent({
                        model,
                        contents,
                        config,
                    });

                console.log(
                    `Gemini success: ${model}`
                );

                return response;
            } catch (error: any) {
                lastError = error;

                console.error(
                    `Gemini error [${model}/${attempt}]:`,
                    error?.message ||
                        error
                );

                const status = Number(
                    error?.status ||
                        error?.code ||
                        0
                );

                // Temporary errors
                if (
                    status !== 429 &&
                    status !== 500 &&
                    status !== 502 &&
                    status !== 503 &&
                    status !== 504
                ) {
                    throw error;
                }

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            1000 * attempt
                        )
                );
            }
        }
    }

    throw (
        lastError ||
        new Error(
            "Gemini request failed"
        )
    );
};

// ==================================================
// NORMALIZE TEXT
// ==================================================

const normalizeText = (
    text: string = ""
): string => {
    return text
        .toLowerCase()
        .normalize("NFKC")
        .replace(
            /[^\p{L}\p{N}\s]/gu,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
};

// ==================================================
// STOP WORDS
// ==================================================

const STOP_WORDS =
    new Set<string>([
        // ==========================================
        // ENGLISH
        // ==========================================

        "i",
        "me",
        "my",
        "mine",
        "we",
        "our",
        "ours",

        "you",
        "your",
        "yours",

        "the",
        "a",
        "an",

        "is",
        "are",
        "was",
        "were",
        "am",
        "be",
        "been",
        "being",

        "have",
        "has",
        "had",

        "this",
        "that",
        "these",
        "those",

        "it",
        "its",

        "there",
        "here",

        "in",
        "on",
        "at",
        "near",
        "from",
        "to",
        "of",
        "for",
        "with",
        "by",

        "and",
        "or",

        "found",
        "find",
        "lost",

        "item",
        "thing",
        "product",

        "please",
        "want",
        "looking",
        "something",
        "someone",

        "did",
        "do",
        "does",

        "can",
        "could",
        "would",
        "should",

        "where",
        "when",
        "what",
        "which",

        // ==========================================
        // BENGALI
        // ==========================================

        "আমি",
        "আমার",
        "আমাকে",
        "আমাদের",

        "একটা",
        "একটি",

        "কোনো",
        "কোন",

        "এই",
        "ওই",
        "সেই",

        "ছিল",
        "ছিলাম",
        "ছিলেন",

        "হয়",
        "হয়",

        "হয়েছে",
        "হয়েছে",

        "হারানো",
        "হারিয়েছে",
        "হারিয়েছে",

        "হারিয়েছি",
        "হারিয়েছি",

        "পেয়েছি",
        "পেয়েছি",

        "পাওয়া",
        "পাওয়া",

        "কাছে",
        "দিকে",
    ]);

// ==================================================
// GET WORDS
// ==================================================

const getWords = (
    text: string
): string[] => {
    return normalizeText(text)
        .split(/\s+/)
        .filter(
            (word) =>
                word.length >= 2 &&
                !STOP_WORDS.has(word)
        );
};

// ==================================================
// UNIQUE WORDS
// ==================================================

const uniqueWords = (
    words: string[]
): string[] => {
    return [
        ...new Set(
            words.filter(Boolean)
        ),
    ];
};

// ==================================================
// NUMBERS
// ==================================================

const getNumbers = (
    text: string
): string[] => {
    return [
        ...new Set(
            normalizeText(text).match(
                /\b\d+\b/g
            ) || []
        ),
    ];
};

// ==================================================
// LOCATION WORDS
// ==================================================

const LOCATION_WORDS = [
    "floor",
    "building",
    "room",
    "gate",
    "road",
    "street",
    "campus",
    "office",
    "hall",
    "lab",
    "library",
    "department",
    "station",
    "market",
    "mall",
    "shop",
    "store",
    "classroom",
    "hostel",
    "block",
];

// ==================================================
// LOCATION SCORE
// ==================================================

const calculateLocationScore = (
    searchText: string,
    candidateText: string
): number => {
    const search =
        normalizeText(searchText);

    const candidate =
        normalizeText(candidateText);

    let score = 0;

    // ==========================================
    // SAME NUMBER
    // ==========================================

    const searchNumbers =
        getNumbers(search);

    const candidateNumbers =
        getNumbers(candidate);

    if (
        searchNumbers.length > 0 &&
        candidateNumbers.length > 0
    ) {
        const sameNumber =
            searchNumbers.some(
                (number) =>
                    candidateNumbers.includes(
                        number
                    )
            );

        if (sameNumber) {
            score += 20;
        }
    }

    // ==========================================
    // SAME LOCATION WORD
    // ==========================================

    const sameLocationWord =
        LOCATION_WORDS.some(
            (word) =>
                search.includes(word) &&
                candidate.includes(word)
        );

    if (sameLocationWord) {
        score += 15;
    }

    return Math.min(
        35,
        score
    );
};

// ==================================================
// GENERIC LOCAL SEMANTIC GROUPS
// ==================================================
//
// These are broad category relationships.
// They are NOT phone-only.
//
// They help local fallback understand:
//
// phone ↔ iphone
// bag ↔ backpack
// wallet ↔ purse
// ID ↔ identification card
// etc.
//
// ==================================================

const SEMANTIC_GROUPS: string[][] = [
    [
        "phone",
        "iphone",
        "smartphone",
        "mobile",
        "cellphone",
        "cell",
    ],

    [
        "wallet",
        "purse",
        "moneybag",
    ],

    [
        "bag",
        "backpack",
        "rucksack",
        "handbag",
        "schoolbag",
        "luggage",
    ],

    [
        "id",
        "identification",
        "card",
        "studentid",
        "universityid",
        "identity",
    ],

    [
        "passport",
        "travelpassport",
    ],

    [
        "key",
        "keys",
        "keyring",
        "keychain",
    ],

    [
        "glasses",
        "spectacles",
        "eyeglasses",
        "sunglasses",
    ],

    [
        "earbuds",
        "earphone",
        "earphones",
        "headphone",
        "headphones",
    ],

    [
        "laptop",
        "notebook",
        "computer",
        "macbook",
    ],

    [
        "watch",
        "wristwatch",
        "smartwatch",
    ],

    [
        "camera",
        "photocamera",
        "dslr",
    ],

    [
        "charger",
        "adapter",
        "poweradapter",
    ],

    [
        "book",
        "textbook",
        "notebookbook",
    ],

    [
        "document",
        "documents",
        "paper",
        "papers",
        "certificate",
    ],

    [
        "clothes",
        "shirt",
        "tshirt",
        "pant",
        "trouser",
        "jacket",
        "dress",
    ],

    [
        "jewelry",
        "jewellery",
        "ring",
        "necklace",
        "bracelet",
        "earring",
    ],

    [
        "umbrella",
        "rainumbrella",
    ],

    [
        "bottle",
        "waterbottle",
        "flask",
    ],

    [
        "toy",
        "doll",
        "teddy",
    ],
];

// ==================================================
// SEMANTIC GROUP LOOKUP
// ==================================================

const getSemanticGroup = (
    word: string
): string[] | null => {
    const normalized =
        normalizeText(word).replace(
            /\s+/g,
            ""
        );

    for (
        const group of SEMANTIC_GROUPS
    ) {
        if (
            group.includes(
                normalized
            )
        ) {
            return group;
        }
    }

    return null;
};

// ==================================================
// SEMANTIC WORD MATCH
// ==================================================

const wordsSemanticallyMatch = (
    wordA: string,
    wordB: string
): boolean => {
    const a =
        normalizeText(wordA);

    const b =
        normalizeText(wordB);

    if (!a || !b) {
        return false;
    }

    if (a === b) {
        return true;
    }

    const groupA =
        getSemanticGroup(a);

    const groupB =
        getSemanticGroup(b);

    if (
        groupA &&
        groupB &&
        groupA === groupB
    ) {
        return true;
    }

    return false;
};

// ==================================================
// SEMANTIC MATCH COUNT
// ==================================================

const calculateSemanticMatches = (
    searchWords: string[],
    candidateWords: string[]
): number => {
    let matched = 0;

    const usedCandidateIndexes =
        new Set<number>();

    for (
        const searchWord of searchWords
    ) {
        for (
            let i = 0;
            i < candidateWords.length;
            i++
        ) {
            if (
                usedCandidateIndexes.has(i)
            ) {
                continue;
            }

            if (
                wordsSemanticallyMatch(
                    searchWord,
                    candidateWords[i]
                )
            ) {
                matched++;

                usedCandidateIndexes.add(
                    i
                );

                break;
            }
        }
    }

    return matched;
};

// ==================================================
// LOCAL SCORE
// ==================================================

const calculateLocalScore = (
    searchText: string,
    candidateText: string
): number => {
    const searchWords =
        uniqueWords(
            getWords(searchText)
        );

    const candidateWords =
        uniqueWords(
            getWords(candidateText)
        );

    if (
        searchWords.length === 0 ||
        candidateWords.length === 0
    ) {
        return calculateLocationScore(
            searchText,
            candidateText
        );
    }

    // ==========================================
    // EXACT + SEMANTIC MATCH
    // ==========================================

    const exactMatched =
        searchWords.filter(
            (searchWord) =>
                candidateWords.includes(
                    searchWord
                )
        ).length;

    const semanticMatched =
        calculateSemanticMatches(
            searchWords,
            candidateWords
        );

    const matched = Math.max(
        exactMatched,
        semanticMatched
    );

    // ==========================================
    // COVERAGE
    // ==========================================

    const keywordCoverage =
        matched /
        Math.max(
            1,
            searchWords.length
        );

    // ==========================================
    // JACCARD-LIKE SCORE
    // ==========================================

    const unionSize =
        new Set([
            ...searchWords,
            ...candidateWords,
        ]).size;

    const jaccard =
        matched /
        Math.max(
            1,
            unionSize
        );

    let score =
        keywordCoverage * 55 +
        jaccard * 20;

    // ==========================================
    // LOCATION / NUMBER
    // ==========================================

    score +=
        calculateLocationScore(
            searchText,
            candidateText
        );

    return Math.min(
        100,
        Math.max(
            0,
            Math.round(score)
        )
    );
};

// ==================================================
// EMPTY PRODUCT INFO
// ==================================================

const emptyProductInfo =
    (): ProductInfo => ({
        product: "",
        category: "",
        brand: "",
        model: "",
        color: "",
        material: "",
        location: "",
        date: "",
        time: "",
        distinctiveFeatures: [],
        keywords: [],
    });

// ==================================================
// EXTRACT PRODUCT INFO
// ==================================================

const extractProductInfo =
    async (
        description: string
    ): Promise<ProductInfo> => {
        const fallback =
            emptyProductInfo();

        const prompt = `
You are an advanced item understanding engine
for a Lost and Found application.

The application can contain ANY physical item.

Examples include:

phone
iPhone
laptop
wallet
purse
bag
backpack
watch
keys
passport
ID card
student ID
book
document
glasses
earbuds
headphones
camera
charger
umbrella
clothes
jewelry
bottle
toy
electronic device
and any other physical object.

The user's description may be:

English
Bengali
Banglish
or mixed language.

Extract:

product
category
brand
model
color
material
location
date
time
distinctiveFeatures
keywords

RULES:

1. Never invent information.

2. Missing information must be empty.

3. Understand semantic meaning.

4. product should be the most specific item
   when possible.

5. category should be the broad category.

6. Brand and model are separate.

7. Preserve exact model numbers.

8. Preserve exact colors.

9. Preserve useful location information.

10. Preserve useful date/time information.

11. Preserve distinctive physical features.

12. Understand Bengali and Banglish.

13. Do not assume missing brand,
    model or color.

14. "I lost my phone"
    means:

    product = "phone"
    category = "phone"

15. "I lost my iPhone 12"
    means:

    product = "iPhone"
    category = "phone"
    brand = "Apple"
    model = "iPhone 12"

16. "I lost my black leather wallet"
    means:

    product = "wallet"
    category = "wallet"
    color = "black"
    material = "leather"

17. "amar lal bag hariye geche"
    means:

    product = "bag"
    category = "bag"
    color = "red"

18. "I lost my phone on 14th floor"
    means:

    location = "14th floor"

19. Extra details in a found post
    must not automatically create mismatch.

20. A generic item description is valid.
    Do not require brand or model.

21. Return ONLY valid JSON.

USER DESCRIPTION:

${description}
`;

        try {
            const response =
                await generateGemini(
                    prompt,
                    {
                        responseMimeType:
                            "application/json",

                        responseSchema: {
                            type: "object",

                            properties: {
                                product: {
                                    type: "string",
                                },

                                category: {
                                    type: "string",
                                },

                                brand: {
                                    type: "string",
                                },

                                model: {
                                    type: "string",
                                },

                                color: {
                                    type: "string",
                                },

                                material: {
                                    type: "string",
                                },

                                location: {
                                    type: "string",
                                },

                                date: {
                                    type: "string",
                                },

                                time: {
                                    type: "string",
                                },

                                distinctiveFeatures: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                    },
                                },

                                keywords: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                    },
                                },
                            },

                            required: [
                                "product",
                                "category",
                                "brand",
                                "model",
                                "color",
                                "material",
                                "location",
                                "date",
                                "time",
                                "distinctiveFeatures",
                                "keywords",
                            ],
                        },
                    }
                );

            const result =
                parseJson<ProductInfo>(
                    response.text ||
                        "{}",
                    fallback
                );

            return {
                product:
                    result.product ||
                    "",

                category:
                    result.category ||
                    result.product ||
                    "",

                brand:
                    result.brand ||
                    "",

                model:
                    result.model ||
                    "",

                color:
                    result.color ||
                    "",

                material:
                    result.material ||
                    "",

                location:
                    result.location ||
                    "",

                date:
                    result.date ||
                    "",

                time:
                    result.time ||
                    "",

                distinctiveFeatures:
                    Array.isArray(
                        result.distinctiveFeatures
                    )
                        ? result.distinctiveFeatures
                        : [],

                keywords:
                    Array.isArray(
                        result.keywords
                    )
                        ? result.keywords
                        : [],
            };
        } catch (error) {
            console.error(
                "PRODUCT EXTRACTION ERROR:",
                error
            );

            const words =
                uniqueWords(
                    getWords(
                        description
                    )
                );

            return {
                ...fallback,

                product:
                    words.join(" "),

                category:
                    words.join(" "),

                keywords:
                    words,
            };
        }
    };

// ==================================================
// BUILD SEARCH TEXT
// ==================================================

const buildSearchText = (
    info: ProductInfo,
    originalDescription: string
): string => {
    const parts = [
        originalDescription,

        info.product,

        info.category,

        info.brand,

        info.model,

        info.color,

        info.material,

        info.location,

        info.date,

        info.time,

        ...info.distinctiveFeatures,

        ...info.keywords,
    ];

    return uniqueWords(
        parts.flatMap(
            (part) =>
                getWords(part)
        )
    ).join(" ");
};

// ==================================================
// BUILD CANDIDATE TEXT
// ==================================================

const buildCandidateText = (
    post: any
): string => {
    const parts = [
        post.description || "",

        post.location || "",

        post.date || "",

        post.time || "",
    ];

    return uniqueWords(
        parts.flatMap(
            (part) =>
                getWords(part)
        )
    ).join(" ");
};

// ==================================================
// GEMINI SEMANTIC MATCHING
// ==================================================

const compareCandidatesWithGemini =
    async (
        lostDescription: string,
        lostInfo: ProductInfo,
        candidates: Array<{
            index: number;
            description: string;
            localScore: number;
        }>
    ): Promise<GeminiMatch[]> => {
        if (
            candidates.length === 0
        ) {
            return [];
        }

        const candidateText =
            candidates
                .map(
                    (candidate) => `
========================================
CANDIDATE ${candidate.index}
========================================

Local score:
${candidate.localScore}

Found post:
${candidate.description}
`
                )
                .join("\n");

        const prompt = `
You are the FINAL semantic matching engine
for a Lost and Found application.

The user has LOST an item.

Compare the user's lost description
against FOUND posts.

Do NOT use only exact keyword matching.

Understand semantic meaning.

==================================================
USER LOST DESCRIPTION
==================================================

${lostDescription}

==================================================
EXTRACTED LOST INFORMATION
==================================================

${JSON.stringify(
            lostInfo,
            null,
            2
        )}

==================================================
FOUND CANDIDATES
==================================================

${candidateText}

==================================================
MATCH FACTORS
==================================================

Consider:

1. General item/category
2. Specific item
3. Brand
4. Model
5. Color
6. Material
7. Distinctive features
8. Location
9. Date
10. Time
11. Semantic similarity
12. Bengali meaning
13. Banglish meaning

==================================================
SEMANTIC EXAMPLES
==================================================

LOST:
"I lost my phone"

FOUND:
"I found an iPhone 12"

→ Valid possible match.

LOST:
"I lost my wallet"

FOUND:
"I found a leather purse"

→ Possible match.

LOST:
"I lost my university ID"

FOUND:
"I found a student identification card"

→ Possible match.

LOST:
"amar lal bag hariye geche"

FOUND:
"Found a red backpack"

→ Possible match.

==================================================
GENERIC QUERY
==================================================

If the user only says:

"I lost my phone"

"I lost my wallet"

"I lost my bag"

"I lost my keys"

"I lost my passport"

then a FOUND post describing
the same general category should
receive a meaningful score.

Do NOT require exact brand,
model or color.

==================================================
MISSING INFORMATION
==================================================

If the user does not provide:

brand
model
color
material
location
date
time

DO NOT penalize the candidate
for having those details.

Missing information is NEUTRAL.

==================================================
EXTRA INFORMATION
==================================================

Extra information in a found post
is NOT automatically a contradiction.

Example:

LOST:
"I lost my phone"

FOUND:
"I found an iPhone 12, black,
on the 14th floor."

This can still be a strong match.

==================================================
CONFLICTS
==================================================

Known contradictory information
should reduce the score.

Examples:

LOST:
"black wallet"

FOUND:
"white wallet"

→ reduce score.

LOST:
"iPhone 12"

FOUND:
"Samsung S24"

→ strongly reduce score.

LOST:
"phone"

FOUND:
"laptop"

→ very low score.

==================================================
LOCATION
==================================================

If both descriptions mention
the same location, increase the score.

Example:

LOST:
"I lost my phone on 14th floor"

FOUND:
"I found an iPhone 12 on 14th floor"

This should be stronger than
a phone match without location.

==================================================
SCORING
==================================================

0-19
Unrelated.

20-39
Weak.

40-59
Possible.

60-74
Good possibility.

75-89
Likely.

90-100
Very strong.

==================================================
IMPORTANT
==================================================

Do not give 90+ only because
the general category matches.

90+ requires strong additional
evidence such as:

matching model
matching brand
matching color
matching unique features
matching location
or multiple matching details.

==================================================
SPECIFIC TEST
==================================================

LOST:

"I lost my phone on 14th floor"

FOUND:

"I found a phone iPhone 12 in 14th floor"

This SHOULD normally receive
around 70-85.

==================================================
OUTPUT
==================================================

Return exactly ONE result
for EVERY candidate.

Return ONLY JSON:

{
    "matches": [
        {
            "index": 1,
            "score": 75,
            "reason": "The found item matches the lost item category and the location is also consistent."
        }
    ]
}
`;

        try {
            const response =
                await generateGemini(
                    prompt,
                    {
                        responseMimeType:
                            "application/json",

                        responseSchema: {
                            type: "object",

                            properties: {
                                matches: {
                                    type: "array",

                                    items: {
                                        type: "object",

                                        properties: {
                                            index: {
                                                type: "integer",
                                            },

                                            score: {
                                                type: "number",
                                            },

                                            reason: {
                                                type: "string",
                                            },
                                        },

                                        required: [
                                            "index",
                                            "score",
                                            "reason",
                                        ],
                                    },
                                },
                            },

                            required: [
                                "matches",
                            ],
                        },
                    }
                );

            const parsed =
                parseJson<{
                    matches: GeminiMatch[];
                }>(
                    response.text ||
                        "{}",
                    {
                        matches: [],
                    }
                );

            if (
                !Array.isArray(
                    parsed.matches
                )
            ) {
                return [];
            }

            return parsed.matches
                .map(
                    (item) => ({
                        index:
                            Number(
                                item.index
                            ),

                        score:
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Math.round(
                                        Number(
                                            item.score
                                        ) || 0
                                    )
                                )
                            ),

                        reason:
                            item.reason ||
                            "Possible match based on semantic similarity.",
                    })
                )
                .filter(
                    (item) =>
                        Number.isInteger(
                            item.index
                        )
                );
        } catch (error) {
            console.error(
                "GEMINI MATCH ERROR:",
                error
            );

            return [];
        }
    };

// ==================================================
// CREATE RESULT
// ==================================================

const createMatchResult = (
    post: any,
    matchScore: number,
    reason: string
): MatchResult => {
    // ==========================================
    // IMPORTANT
    // ==========================================
    //
    // Preserve original MongoDB Post ID.
    //
    // Both _id and postId are returned.
    //
    // ==========================================

    const postId =
        String(post._id);

    return {
        _id: postId,

        postId: postId,

        userId:
            post.userId,

        postType:
            post.postType,

        description:
            post.description || "",

        images:
            post.images || [],

        layout:
            post.layout || "grid",

        status:
            post.status || "ACTIVE",

        likes:
            post.likes || [],

        savedBy:
            post.savedBy || [],

        comments:
            post.comments || [],

        matchScore:
            Math.round(
                Math.max(
                    0,
                    Math.min(
                        100,
                        matchScore
                    )
                )
            ),

        reason,

        createdAt:
            post.createdAt,

        updatedAt:
            post.updatedAt,
    };
};

// ==================================================
// MAIN MATCHING FUNCTION
// ==================================================

export const findProductMatches =
    async (
        description: string,
        userId?: string
    ): Promise<MatchResult[]> => {

        // ==========================================
        // VALIDATE DESCRIPTION
        // ==========================================

        if (
            !description ||
            !description.trim()
        ) {
            throw new Error(
                "Product description is required"
            );
        }

        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (
            userId &&
            !Types.ObjectId.isValid(
                userId
            )
        ) {
            throw new Error(
                "Invalid user ID"
            );
        }

        console.log(
            "\n========================================"
        );

        console.log(
            "AI LOST ITEM SEARCH"
        );

        console.log(
            "========================================"
        );

        console.log(
            "USER QUERY:",
            description
        );

        // ==========================================
        // STEP 1
        // EXTRACT LOST ITEM
        // ==========================================

        const lostInfo =
            await extractProductInfo(
                description
            );

        console.log(
            "EXTRACTED LOST ITEM:"
        );

        console.log(
            JSON.stringify(
                lostInfo,
                null,
                2
            )
        );

        // ==========================================
        // STEP 2
        // BUILD SEARCH TEXT
        // ==========================================

        const searchText =
            buildSearchText(
                lostInfo,
                description
            );

        console.log(
            "SEARCH TEXT:",
            searchText
        );

        // ==========================================
        // STEP 3
        // GET ACTIVE FIND POSTS
        // ==========================================

        const posts =
            await Post.find({
                postType: "FIND",

                status: "ACTIVE",
            })
                .populate(
                    "userId",
                    "name email picture userType"
                )
                .sort({
                    createdAt: -1,
                })
                .lean();

        console.log(
            "ACTIVE FIND POSTS:",
            posts.length
        );

        // ==========================================
        // NO POSTS
        // ==========================================

        if (
            posts.length === 0
        ) {
            console.log(
                "NO ACTIVE FIND POSTS"
            );

            return [];
        }

        // ==========================================
        // STEP 4
        // REMOVE OWN POSTS
        // ==========================================

        const availablePosts =
            posts.filter(
                (post) => {

                    // If user is not authenticated,
                    // don't remove anything.
                    if (!userId) {
                        return true;
                    }

                    const ownerId =
                        post.userId &&
                        typeof post.userId ===
                            "object"
                            ? String(
                                  (
                                      post.userId as any
                                  )._id
                              )
                            : String(
                                  post.userId ||
                                      ""
                              );

                    const currentUserId =
                        String(userId);

                    const isOwnPost =
                        ownerId &&
                        ownerId ===
                            currentUserId;

                    console.log(
                        "POST OWNER CHECK:",
                        {
                            postId:
                                String(
                                    post._id
                                ),

                            ownerId,

                            currentUserId,

                            isOwnPost,
                        }
                    );

                    // Don't match user's
                    // own FIND post.
                    return !isOwnPost;
                }
            );

        console.log(
            "AVAILABLE POSTS:",
            availablePosts.length
        );

        // ==========================================
        // NO AVAILABLE POSTS
        // ==========================================

        if (
            availablePosts.length === 0
        ) {
            console.log(
                "NO AVAILABLE POSTS AFTER OWNER FILTER"
            );

            return [];
        }

        // ==========================================
        // STEP 5
        // LOCAL SCORING
        // ==========================================

        console.log(
            "STARTING LOCAL SCORING..."
        );

        const enrichedPosts =
            availablePosts
                .filter(
                    (post) => {

                        const valid =
                            Boolean(
                                post.description &&
                                post.description.trim()
                            );

                        if (!valid) {
                            console.log(
                                "SKIPPING POST WITHOUT DESCRIPTION:",
                                String(
                                    post._id
                                )
                            );
                        }

                        return valid;
                    }
                )
                .map(
                    (post) => {

                        const candidateText =
                            buildCandidateText(
                                post
                            );

                        const localScore =
                            calculateLocalScore(
                                searchText,
                                candidateText
                            );

                        console.log(
                            "LOCAL SCORE:",
                            {
                                id:
                                    String(
                                        post._id
                                    ),

                                localScore,

                                candidateText:
                                    post.description,
                            }
                        );

                        return {
                            post,

                            localScore,

                            candidateText,
                        };
                    }
                )
                .sort(
                    (a, b) =>
                        b.localScore -
                        a.localScore
                );

        console.log(
            "LOCAL SCORING FINISHED"
        );

        console.log(
            "LOCAL CANDIDATES:",
            enrichedPosts.length
        );

        // ==========================================
        // STEP 6
        // TOP CANDIDATES
        // ==========================================

        const candidates =
            enrichedPosts.slice(
                0,
                MAX_CANDIDATES
            );

        console.log(
            "GEMINI CANDIDATES:",
            candidates.length
        );

        if (
            candidates.length === 0
        ) {
            return [];
        }

        // ==========================================
        // STEP 7
        // GEMINI MATCHING
        // ==========================================

        const geminiMatches =
            await compareCandidatesWithGemini(
                description,

                lostInfo,

                candidates.map(
                    (
                        candidate,
                        index
                    ) => ({
                        index:
                            index + 1,

                        description:
                            candidate.candidateText,

                        localScore:
                            candidate.localScore,
                    })
                )
            );

        console.log(
            "GEMINI MATCHES:",
            JSON.stringify(
                geminiMatches,
                null,
                2
            )
        );

        // ==========================================
        // STEP 8
        // BUILD FINAL RESULTS
        // ==========================================

        const results:
            MatchResult[] = [];

        for (
            let index = 0;
            index <
            candidates.length;
            index++
        ) {
            const candidate =
                candidates[index];

            const post =
                candidate.post;

            const geminiResult =
                geminiMatches.find(
                    (match) =>
                        match.index ===
                        index + 1
                );

            // ======================================
            // GEMINI DID NOT RETURN MATCH
            // ======================================

            if (
                !geminiResult
            ) {
                /*
                 * Gemini failed or didn't return
                 * this candidate.
                 *
                 * Use local fallback.
                 */

                if (
                    candidate.localScore >=
                    50
                ) {
                    results.push(
                        createMatchResult(
                            post,

                            candidate.localScore,

                            "Possible match based on item and description similarity."
                        )
                    );
                }

                continue;
            }

            const aiScore =
                geminiResult.score;

            const localScore =
                candidate.localScore;

            // ======================================
            // FINAL SCORE
            // ======================================

            let finalScore =
                Math.round(
                    aiScore * 0.80 +
                        localScore *
                            0.20
                );

            // ======================================
            // LOCATION BONUS
            // ======================================

            const locationScore =
                calculateLocationScore(
                    description,

                    post.description ||
                        ""
                );

            if (
                locationScore >= 20 &&
                aiScore >= 50
            ) {
                finalScore += 5;
            }

            // ======================================
            // SEMANTIC PROTECTION
            // ======================================

            /*
             * If Gemini considers the match
             * reasonably strong, weak exact
             * keyword matching should not
             * destroy the result.
             */

            if (
                aiScore >= 60 &&
                finalScore < 60
            ) {
                finalScore = 60;
            }

            finalScore =
                Math.max(
                    0,
                    Math.min(
                        100,
                        finalScore
                    )
                );

            console.log(
                "FINAL CANDIDATE:",
                {
                    id:
                        String(
                            post._id
                        ),

                    postId:
                        String(
                            post._id
                        ),

                    description:
                        post.description,

                    localScore,

                    aiScore,

                    locationScore,

                    finalScore,
                }
            );

            // ======================================
            // ACCEPT
            // ======================================

            if (
                finalScore <
                MIN_MATCH_SCORE
            ) {
                continue;
            }

            // ======================================
            // CREATE RESULT
            // ======================================

            results.push(
                createMatchResult(
                    post,

                    finalScore,

                    geminiResult.reason
                )
            );
        }

        // ==========================================
        // STEP 9
        // SORT BY SCORE
        // ==========================================

        results.sort(
            (a, b) =>
                b.matchScore -
                a.matchScore
        );

        // ==========================================
        // FINAL LOG
        // ==========================================

        console.log(
            "\n========================================"
        );

        console.log(
            "FINAL MATCHES:",
            results.length
        );

        results.forEach(
            (result) => {
                console.log({
                    id:
                        result._id,

                    postId:
                        result.postId,

                    score:
                        result.matchScore,

                    description:
                        result.description,

                    reason:
                        result.reason,
                });
            }
        );

        console.log(
            "========================================\n"
        );

        // ==========================================
        // RETURN TOP 10
        // ==========================================

        return results.slice(
            0,
            10
        );
    };