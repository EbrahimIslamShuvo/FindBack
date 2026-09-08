import { Router } from "express";
import {AuthControllers,} from "./auth.controller.js";
import { uploadProfile } from "../../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/register",
  uploadProfile.single("picture"),
  AuthControllers.registerUser
);

router.post(
  "/verify-signup-otp",
  AuthControllers.verifySignupOtp
);

router.post(
  "/login",
  AuthControllers.loginUser
);

router.post(
  "/forgot-password",
  AuthControllers.forgotPassword
);

router.post(
  "/reset-password",
  AuthControllers.resetPassword
);

export const AuthRoutes = router;