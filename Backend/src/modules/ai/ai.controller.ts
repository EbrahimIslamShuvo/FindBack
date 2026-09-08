import {
    Request,
    Response,
} from "express";

import {
    findProductMatches,
} from "./ai.service.js";


// ==================================================
// AI PRODUCT MATCH CONTROLLER
// ==================================================

export const aiProductMatchController =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const {
                description,
            } = req.body;


            // ==========================================
            // USER
            // ==========================================

            const userId =
                (req as any)
                    .user?.id;


            // ==========================================
            // VALIDATE USER
            // ==========================================

            if (!userId) {

                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Unauthorized user",
                    });
            }


            // ==========================================
            // VALIDATE DESCRIPTION
            // ==========================================

            if (
                typeof description !==
                "string" ||
                !description.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please describe what you lost.",
                    });
            }


            // ==========================================
            // FIND MATCHES
            // ==========================================

            const matches =
                await findProductMatches(
                    description.trim(),
                    String(userId)
                );


            // ==========================================
            // RESPONSE
            // ==========================================

            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        matches.length > 0
                            ? "Possible matches found"
                            : "No matching products found",

                    data: {

                        matches,

                        total:
                            matches.length,

                    },

                });

        } catch (error: any) {

            console.error(
                "AI PRODUCT MATCH ERROR:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error?.message ||
                        "Failed to find matching products",

                });
        }
    };