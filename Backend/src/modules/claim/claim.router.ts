import express from "express";
import {
  createClaim,
  getMyClaims,
  getClaimById,
  getAllClaims,
  getPendingClaims,
  initialApproveClaim,
  initialRejectClaim,
  startPhysicalVerification,
  physicalRejectClaim,
  completeClaim,
} from "./claim.controller.js";
import authMiddleware, { authorizeRoles } from "../../middleware/auth.middleware.js";
import { uploadClaim } from "./claim.upload.js";

const router =
  express.Router();

router.post(
  "/post/:postId",
  authMiddleware,
  authorizeRoles(
    "USER"
  ),
  uploadClaim.fields([
    {
      name:
        "claimerImage",

      maxCount:
        1,
    },
    {
      name:
        "proofDocument",

      maxCount:
        1,
    },
  ]),
  createClaim
);

router.get(
  "/my",
  authMiddleware,
  authorizeRoles(
    "USER"
  ),
  getMyClaims
);


router.get(
  "/responsible/pending",
  authMiddleware,
  authorizeRoles(
    "RESPONSIBLE_PERSON","ADMIN"
  ),
  getPendingClaims
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles(
    "ADMIN"
  ),
  getAllClaims
);

router.patch(
  "/:claimId/initial-approve",
  authMiddleware,
  authorizeRoles(
    "RESPONSIBLE_PERSON"
  ),
  initialApproveClaim
);

router.patch(
  "/:claimId/initial-reject",
  authMiddleware,
  authorizeRoles(
    "RESPONSIBLE_PERSON"
  ),
  initialRejectClaim
);

router.patch(
  "/:claimId/physical-verification",
  authMiddleware,
  authorizeRoles(
    "RESPONSIBLE_PERSON","ADMIN"
  ),
  startPhysicalVerification
);

router.patch(
  "/:claimId/physical-reject",
  authMiddleware,
  authorizeRoles(
    "RESPONSIBLE_PERSON"
  ),
  physicalRejectClaim
);

router.patch(
  "/:claimId/complete",
  authMiddleware,
  authorizeRoles(
    "RESPONSIBLE_PERSON"
  ),
  uploadClaim.fields([
    {
      name:
        "responsibleDocument",
      maxCount:
        1,
    },
    {
      name:
        "responsibleStudentIdCard",
      maxCount:
        1,
    },
  ]),
  completeClaim
);

router.get(
  "/:claimId",
  authMiddleware,
  getClaimById
);

export default router;
