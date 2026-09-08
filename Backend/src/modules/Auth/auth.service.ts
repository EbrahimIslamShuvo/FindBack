import {User,} from "../User/user.model.js";
import {
  IRegisterPayload,
  ILoginPayload,
  IVerifyOtpPayload,
  IResetPasswordPayload,
} from "./auth.interface.js";
import {PasswordUtils,} from "../../utils/password.js";
import {generateToken,} from "../../utils/jwt.js";
import {generateOTP,} from "../../utils/otp.js";
import {sendEmail,} from "../../utils/sendEmail.js";

const registerUser = async (
  payload: IRegisterPayload,
  file?: Express.Multer.File
) => {
  const {
    name,
    email,
    password,
    phone,
    institutionId,
  } = payload;

  const normalizedEmail =
    email.toLowerCase().trim();

  const existingEmail =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingEmail) {
    throw new Error(
      "Email already exists"
    );
  }

  const existingId =
    await User.findOne({
      institutionId,
    });

  if (existingId) {
    throw new Error(
      "Institution ID already exists"
    );
  }

  const hashedPassword =
    await PasswordUtils.hashPassword(
      password
    );

  const otp =
    generateOTP();

  const otpExpiresAt =
    new Date(
      Date.now() +
      5 * 60 * 1000
    );

  const picture = file
    ? `/uploads/profile/${file.filename}`
    : "";

  await User.create({
    name,
    email:normalizedEmail,
    password:hashedPassword,
    phone,
    institutionId,
    picture,
    userType:"USER",
    accountStatus:"PENDING",
    isEmailVerified:false,
    otp,
    otpExpiresAt,
  });

  await sendEmail({
    to:normalizedEmail,
    subject:"FindBack - Email Verification",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Welcome to FindBack</h2>
        <p>Hello ${name},</p>
        <p>
          Your verification OTP is:
        </p>
        <h1
          style="
            letter-spacing: 10px;
            color: #2563eb;
          "
        >
          ${otp}
        </h1>
        <p>
          This OTP will expire in 5 minutes.
        </p>
      </div>
    `,
  });

  return {
    email:normalizedEmail,
  };
};

const verifySignupOtp =
  async (
    payload: IVerifyOtpPayload
  ) => {

    const {
      email,
      otp,
    } = payload;


    const user =
      await User.findOne({
        email:email.toLowerCase(),
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    if (
      user.isEmailVerified
    ) {
      throw new Error(
        "Email is already verified"
      );
    }

    if (
      !user.otp ||
      !user.otpExpiresAt
    ) {
      throw new Error(
        "OTP not found"
      );
    }

    if (
      user.otp !== otp
    ) {
      throw new Error(
        "Invalid OTP"
      );
    }

    if (
      user.otpExpiresAt <
      new Date()
    ) {
      throw new Error(
        "OTP has expired"
      );
    }

    user.isEmailVerified =true;
    user.otp = undefined;
    user.otpExpiresAt =undefined;

    await user.save();

    return {
      message:"Email verified successfully",
    };
  };

const loginUser =
  async (
    payload: ILoginPayload
  ) => {

    const {
      email,
      password,
    } = payload;

    const user =
      await User.findOne({
        email:
          email.toLowerCase(),
      }).select(
        "+password"
      );

    if (!user) {
      throw new Error(
        "Invalid email or password"
      );
    }

    const passwordMatch =
      await PasswordUtils.comparePassword(
        password,
        user.password
      );

    if (!passwordMatch) {
      throw new Error(
        "Invalid email or password"
      );
    }

    if (
      !user.isEmailVerified
    ) {
      throw new Error(
        "Please verify your email first"
      );
    }

    if (
      user.accountStatus !==
      "ACTIVE"
    ) {
      throw new Error(
        `Your account is ${user.accountStatus.toLowerCase()}. Please contact the responsible person.`
      );
    }

    const token =
      generateToken({
        id:user._id.toString(),
        email:user.email,
        userType:user.userType,
      });

    return {
      accessToken:token,
      user: {
        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        institutionId:user.institutionId,
        picture:user.picture,
        userType:user.userType,
        accountStatus:user.accountStatus,
      },
    };
  };

const forgotPassword =
  async ({
    email,
  }: {
    email: string;
  }) => {
    const normalizedEmail =
      email.toLowerCase();

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      throw new Error(
        "No account found with this email"
      );
    }

    const otp =generateOTP();
    user.otp =otp;
    user.otpExpiresAt =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    await user.save();
    await sendEmail({
      to:normalizedEmail,
      subject:
        "FindBack - Password Reset OTP",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Password Reset</h2>
          <p>
            Your password reset OTP is:
          </p>
          <h1
            style="
              letter-spacing: 10px;
              color: #2563eb;
            "
          >
            ${otp}
          </h1>
          <p>
            This OTP will expire in 5 minutes.
          </p>
        </div>
      `,
    });
    return {
      message:
        "Password reset OTP sent",
    };
  };

const resetPassword =
  async (
    payload: IResetPasswordPayload
  ) => {
    const {
      email,
      otp,
      newPassword,
    } = payload;

    const user =
      await User.findOne({
        email:email.toLowerCase(),
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    if (
      !user.otp ||
      !user.otpExpiresAt
    ) {
      throw new Error(
        "OTP not found"
      );
    }

    if (
      user.otp !== otp
    ) {
      throw new Error(
        "Invalid OTP"
      );
    }

    if (
      user.otpExpiresAt <
      new Date()
    ) {
      throw new Error(
        "OTP has expired"
      );
    }

    user.password =await PasswordUtils.hashPassword(
        newPassword
      );
    user.otp =undefined;
    user.otpExpiresAt =undefined;
    await user.save();

    return {
      message:
        "Password reset successfully",
    };
  };

export const AuthServices = {
  registerUser,
  verifySignupOtp,
  loginUser,
  forgotPassword,
  resetPassword,
};