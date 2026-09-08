import {
  Schema,
  model,
} from "mongoose";

import {
  IUser,
} from "./user.interface.js";

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema =
  new Schema<IUser>(
    {
      // ====================================
      // NAME
      // ====================================

      name: {
        type: String,
        required: true,
        trim: true,
      },

      // ====================================
      // EMAIL
      // ====================================

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      // ====================================
      // PASSWORD
      // ====================================

      password: {
        type: String,
        required: true,
        select: false,
      },

      // ====================================
      // PHONE
      // ====================================

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      // ====================================
      // INSTITUTION ID
      // ====================================

      institutionId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      // ====================================
      // PROFILE PICTURE
      // ====================================

      picture: {
        type: String,
        default: "",
      },

      // ====================================
      // USER TYPE
      // ====================================

      userType: {
        type: String,
        enum: [
          "USER",
          "RESPONSIBLE_PERSON",
          "ADMIN",
        ],
        default: "USER",
      },

      // ====================================
      // ACCOUNT STATUS
      // ====================================

      accountStatus: {
        type: String,
        enum: [
          "PENDING",
          "ACTIVE",
          "REJECTED",
          "BLOCKED",
        ],
        default: "PENDING",
      },

      // ====================================
      // EMAIL VERIFIED
      // ====================================

      isEmailVerified: {
        type: Boolean,
        default: false,
      },

      // ====================================
      // OTP
      // ====================================

      otp: {
        type: String,
      },

      // ====================================
      // OTP EXPIRY
      // ====================================

      otpExpiresAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

// ==========================================
// MODEL
// ==========================================

export const User =
  model<IUser>(
    "User",
    userSchema
  );