import bcrypt from "bcryptjs";

import {
  User,
} from "./user.model.js";

// ==========================================
// SAFE USER SELECT
// ==========================================

const safeUserSelect =
  "-password -otp -otpExpiresAt";

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsersFromDB =
  async () => {

    const result =
      await User.find()
        .select(
          safeUserSelect
        )
        .sort({
          createdAt: -1,
        });

    return result;
  };

// ==========================================
// GET SINGLE USER
// ==========================================

const getSingleUserFromDB =
  async (
    id: string
  ) => {

    const result =
      await User.findById(id)
        .select(
          safeUserSelect
        );

    return result;
  };

// ==========================================
// GET MY PROFILE
// ==========================================

const getMyProfileFromDB =
  async (
    id: string
  ) => {

    const result =
      await User.findById(id)
        .select(
          safeUserSelect
        );

    return result;
  };

// ==========================================
// UPDATE USER
// ==========================================

const updateUserInDB =
  async (
    id: string,
    payload: Record<
      string,
      unknown
    >
  ) => {

    const allowedFields = [
      "name",
      "phone",
      "institutionId",
      "picture",
    ];

    const updateData:
      Record<string, unknown> = {};

    for (
      const field of allowedFields
    ) {

      if (
        payload[field] !== undefined
      ) {

        updateData[field] =
          payload[field];

      }
    }

    const result =
      await User.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select(
        safeUserSelect
      );

    return result;
  };

// ==========================================
// DELETE USER
// ==========================================

const deleteUserFromDB =
  async (
    id: string
  ) => {

    const result =
      await User.findByIdAndDelete(
        id
      );

    return result;
  };

// ==========================================
// VERIFY PROFILE PASSWORD
// ==========================================

const verifyProfilePasswordInDB =
  async (
    id: string,
    password: string
  ) => {

    const user =
      await User.findById(id)
        .select(
          "+password"
        );

    if (!user) {

      return {
        success: false,
        message:
          "User not found",
      };
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {

      return {
        success: false,
        message:
          "Incorrect password",
      };
    }

    return {
      success: true,
      message:
        "Password verified",
    };
  };

// ==========================================
// UPDATE MY PROFILE
// ==========================================

const updateMyProfileInDB =
  async (
    id: string,
    payload: {
      name?: string;
      phone?: string;
      institutionId?: string;
      picture?: string;
    }
  ) => {

    const updateData:
      Record<string, unknown> = {};

    if (
      payload.name !== undefined
    ) {

      updateData.name =
        payload.name;
    }

    if (
      payload.phone !== undefined
    ) {

      updateData.phone =
        payload.phone;
    }

    if (
      payload.institutionId !==
      undefined
    ) {

      updateData.institutionId =
        payload.institutionId;
    }

    if (
      payload.picture !== undefined
    ) {

      updateData.picture =
        payload.picture;
    }

    const result =
      await User.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select(
        safeUserSelect
      );

    return result;
  };

// ==========================================
// GET USERS FOR MANAGEMENT
// ==========================================

const getUsersForManagementFromDB =
  async () => {

    const result =
      await User.find()
        .select(
          safeUserSelect
        )
        .sort({
          createdAt: -1,
        });

    return result;
  };

// ==========================================
// VERIFY USER
// ==========================================

const verifyUserInDB =
  async (
    id: string
  ) => {

    const result =
      await User.findByIdAndUpdate(
        id,
        {
          accountStatus:
            "ACTIVE",
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        safeUserSelect
      );

    return result;
  };

// ==========================================
// BLOCK USER
// ==========================================

const blockUserInDB =
  async (
    id: string
  ) => {

    const result =
      await User.findByIdAndUpdate(
        id,
        {
          accountStatus:
            "BLOCKED",
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        safeUserSelect
      );

    return result;
  };

// ==========================================
// UNBLOCK USER
// ==========================================

const unblockUserInDB =
  async (
    id: string
  ) => {

    const result =
      await User.findByIdAndUpdate(
        id,
        {
          accountStatus:
            "ACTIVE",
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        safeUserSelect
      );

    return result;
  };

// ==========================================
// CREATE RESPONSIBLE PERSON
// ==========================================

const createResponsiblePersonInDB =
  async (
    payload: {
      name: string;
      email: string;
      phone: string;
      institutionId: string;
      password: string;
    }
  ) => {

    const existingEmail =
      await User.findOne({
        email:
          payload.email
            .toLowerCase()
            .trim(),
      });

    if (existingEmail) {

      throw new Error(
        "Email already exists"
      );
    }

    const existingInstitution =
      await User.findOne({
        institutionId:
          payload.institutionId,
      });

    if (existingInstitution) {

      throw new Error(
        "Institution ID already exists"
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        payload.password,
        10
      );

    const result =
      await User.create({

        name:
          payload.name,

        email:
          payload.email
            .toLowerCase()
            .trim(),

        phone:
          payload.phone,

        institutionId:
          payload.institutionId,

        password:
          hashedPassword,

        userType:
          "RESPONSIBLE_PERSON",

        accountStatus:
          "ACTIVE",

        isEmailVerified:
          true,
      });

    return result;
  };

// ==========================================
// EXPORT
// ==========================================

export const UserServices = {

  getAllUsersFromDB,

  getSingleUserFromDB,

  getMyProfileFromDB,

  updateUserInDB,

  deleteUserFromDB,

  verifyProfilePasswordInDB,

  updateMyProfileInDB,

  getUsersForManagementFromDB,

  verifyUserInDB,

  blockUserInDB,

  unblockUserInDB,

  createResponsiblePersonInDB,
};