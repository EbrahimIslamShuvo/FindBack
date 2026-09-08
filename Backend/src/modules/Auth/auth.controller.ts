import { Request, Response } from "express";
import { AuthServices } from "./auth.service.js";

const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("REGISTER BODY:", req.body);
    console.log("REGISTER FILE:", req.file);
    const result = await AuthServices.registerUser(
      req.body,
      req.file
    );
    res.status(201).json({
      success: true,
      message:
        "Registration successful. OTP sent to email.",
      data: result,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Registration failed",
    });
  }
};

const verifySignupOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await AuthServices.verifySignupOtp(req.body);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("OTP ERROR:", error);
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "OTP verification failed",
    });
  }
};

const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await AuthServices.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    });
  }
};

const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await AuthServices.forgotPassword(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send OTP",
    });
  }
};

const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await AuthServices.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Password reset failed",
    });
  }
};

export const AuthControllers = {
  registerUser,
  verifySignupOtp,
  loginUser,
  forgotPassword,
  resetPassword,
};