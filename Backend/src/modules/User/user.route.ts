import {
  Router,
} from "express";

import {
  UserControllers,
} from "./user.controller.js";

import authMiddleware, {
  authorizeRoles,
} from "../../middleware/auth.middleware.js";

import {
  uploadProfileImage,
} from "./user.upload.js";

const router =
  Router();

// ==========================================
// USER MANAGEMENT
// ==========================================

// ADMIN + RESPONSIBLE PERSON

router.get(
  "/management",
  authMiddleware,
  authorizeRoles(
    "ADMIN",
    "RESPONSIBLE_PERSON"
  ),
  UserControllers
    .getUsersForManagement
);

// ==========================================
// CREATE RESPONSIBLE PERSON
// ADMIN ONLY
// ==========================================

router.post(
  "/responsible-person",
  authMiddleware,
  authorizeRoles(
    "ADMIN"
  ),
  UserControllers
    .createResponsiblePerson
);

// ==========================================
// MY PROFILE
// ==========================================

router.get(
  "/profile/me",
  authMiddleware,
  UserControllers
    .getMyProfile
);

// ==========================================
// VERIFY PROFILE PASSWORD
// ==========================================

router.post(
  "/profile/verify-password",
  authMiddleware,
  UserControllers
    .verifyProfilePassword
);

// ==========================================
// UPDATE MY PROFILE
// PASSWORD REQUIRED
// IMAGE OPTIONAL
// ==========================================

router.patch(
  "/profile/me",
  authMiddleware,
  uploadProfileImage.single(
    "picture"
  ),
  UserControllers
    .updateMyProfile
);

// ==========================================
// VERIFY USER
// ==========================================

router.patch(
  "/:id/verify",
  authMiddleware,
  authorizeRoles(
    "ADMIN",
    "RESPONSIBLE_PERSON"
  ),
  UserControllers
    .verifyUser
);

// ==========================================
// BLOCK USER
// ==========================================

router.patch(
  "/:id/block",
  authMiddleware,
  authorizeRoles(
    "ADMIN",
    "RESPONSIBLE_PERSON"
  ),
  UserControllers
    .blockUser
);

// ==========================================
// UNBLOCK USER
// ADMIN ONLY
// ==========================================

router.patch(
  "/:id/unblock",
  authMiddleware,
  authorizeRoles(
    "ADMIN"
  ),
  UserControllers
    .unblockUser
);

// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/",
  authMiddleware,
  authorizeRoles(
    "ADMIN",
    "RESPONSIBLE_PERSON"
  ),
  UserControllers
    .getAllUsers
);

// ==========================================
// GET SINGLE USER
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  UserControllers
    .getSingleUser
);

// ==========================================
// UPDATE USER
// ==========================================

router.patch(
  "/:id",
  authMiddleware,
  UserControllers
    .updateUser
);

// ==========================================
// DELETE USER
// ADMIN ONLY
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(
    "ADMIN"
  ),
  UserControllers
    .deleteUser
);

export const UserRoutes =
  router;