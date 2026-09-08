import api from "../utils/api";


// REGISTER

export const registerUser =
  async (userData) => {

    const response =
      await api.post(
        "/auth/register",
        userData
      );

    return response.data;
  };


// VERIFY SIGNUP OTP

export const verifySignupOtp =
  async (data) => {

    const response =
      await api.post(
        "/auth/verify-signup-otp",
        data
      );

    return response.data;
  };


// LOGIN

export const loginUser =
  async (data) => {

    const response =
      await api.post(
        "/auth/login",
        data
      );

    return response.data;
  };


// FORGOT PASSWORD

export const forgotPassword =
  async (data) => {

    const response =
      await api.post(
        "/auth/forgot-password",
        data
      );

    return response.data;
  };


// RESET PASSWORD

export const resetPassword =
  async (data) => {

    const response =
      await api.post(
        "/auth/reset-password",
        data
      );

    return response.data;
  };