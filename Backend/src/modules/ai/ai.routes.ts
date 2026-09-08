import {
    Router,
} from "express";

import {
    aiProductMatchController,
} from "./ai.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";


const router =
    Router();


// ==================================================
// AI PRODUCT MATCH
// ==================================================

router.post(
    "/match",
    authMiddleware,
    aiProductMatchController
);


export default router;