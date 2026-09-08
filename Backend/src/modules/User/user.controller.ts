import {
  Request,
  Response,
} from "express";

import {
  UserServices,
} from "./user.service.js";

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const result =
        await UserServices
          .getAllUsersFromDB();

      res.status(200).json({
        success: true,
        message:
          "Users retrieved successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to retrieve users",
      });
    }
  };

// ==========================================
// GET SINGLE USER
// ==========================================

const getSingleUser =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        id,
      } = req.params;

      const result =
        await UserServices
          .getSingleUserFromDB(
            id as string
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "User retrieved successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to retrieve user",
      });
    }
  };

// ==========================================
// GET MY PROFILE
// ==========================================

const getMyProfile =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const user =
        (req as any).user;

      if (!user?.id) {

        return res.status(401).json({
          success: false,
          message:
            "User is not authenticated",
        });
      }

      const result =
        await UserServices
          .getMyProfileFromDB(
            user.id
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Profile retrieved successfully",
        data: result,
      });

    } catch (error) {

      console.error(
        "GET PROFILE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load profile",
      });
    }
  };

// ==========================================
// VERIFY PROFILE PASSWORD
// ==========================================

const verifyProfilePassword =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const user =
        (req as any).user;

      if (!user?.id) {

        return res.status(401).json({
          success: false,
          message:
            "User is not authenticated",
        });
      }

      const {
        password,
      } = req.body;

      if (!password) {

        return res.status(400).json({
          success: false,
          message:
            "Password is required",
        });
      }

      const result =
        await UserServices
          .verifyProfilePasswordInDB(
            user.id,
            password
          );

      if (!result.success) {

        return res.status(401).json({
          success: false,
          message:
            result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Password verified successfully",
      });

    } catch (error) {

      console.error(
        "PASSWORD VERIFY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Password verification failed",
      });
    }
  };

// ==========================================
// UPDATE MY PROFILE
// ==========================================

const updateMyProfile =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const user =
        (req as any).user;

      if (!user?.id) {

        return res.status(401).json({
          success: false,
          message:
            "User is not authenticated",
        });
      }

      const {
        password,
        name,
        phone,
        institutionId,
      } = req.body;

      // ====================================
      // PASSWORD REQUIRED
      // ====================================

      if (!password) {

        return res.status(400).json({
          success: false,
          message:
            "Password is required to update profile",
        });
      }

      // ====================================
      // VERIFY PASSWORD
      // ====================================

      const passwordCheck =
        await UserServices
          .verifyProfilePasswordInDB(
            user.id,
            password
          );

      if (
        !passwordCheck.success
      ) {

        return res.status(401).json({
          success: false,
          message:
            "Incorrect password",
        });
      }

      // ====================================
      // UPDATE DATA
      // ====================================

      const updateData: {
        name?: string;
        phone?: string;
        institutionId?: string;
        picture?: string;
      } = {};

      if (
        name !== undefined
      ) {

        updateData.name =
          name;
      }

      if (
        phone !== undefined
      ) {

        updateData.phone =
          phone;
      }

      if (
        institutionId !==
        undefined
      ) {

        updateData.institutionId =
          institutionId;
      }

      // ====================================
      // IMAGE
      // ====================================

      if (req.file) {

        updateData.picture =
          `/uploads/profile/${req.file.filename}`;
      }

      // ====================================
      // DATABASE UPDATE
      // ====================================

      const result =
        await UserServices
          .updateMyProfileInDB(
            user.id,
            updateData
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      // ====================================
      // RESPONSE
      // ====================================

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully",
        data: result,
      });

    } catch (error: any) {

      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      // Mongo duplicate key
      if (
        error?.code === 11000
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Institution ID already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Failed to update profile",
      });
    }
  };

// ==========================================
// UPDATE USER
// ==========================================

const updateUser =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        id,
      } = req.params;

      const result =
        await UserServices
          .updateUserInDB(
            id as string,
            req.body
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "User updated successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to update user",
      });
    }
  };

// ==========================================
// DELETE USER
// ==========================================

const deleteUser =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        id,
      } = req.params;

      const result =
        await UserServices
          .deleteUserFromDB(
            id as string
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "User deleted successfully",
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to delete user",
      });
    }
  };

// ==========================================
// MANAGEMENT
// ==========================================

const getUsersForManagement =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const result =
        await UserServices
          .getUsersForManagementFromDB();

      res.status(200).json({
        success: true,
        message:
          "Users retrieved successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to retrieve users",
      });
    }
  };

// ==========================================
// VERIFY USER
// ==========================================

const verifyUser =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        id,
      } = req.params;

      const result =
        await UserServices
          .verifyUserInDB(
            id as string
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "User verified successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to verify user",
      });
    }
  };

// ==========================================
// BLOCK USER
// ==========================================

const blockUser =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        id,
      } = req.params;

      const result =
        await UserServices
          .blockUserInDB(
            id as string
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "User blocked successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to block user",
      });
    }
  };

// ==========================================
// UNBLOCK USER
// ==========================================

const unblockUser =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        id,
      } = req.params;

      const result =
        await UserServices
          .unblockUserInDB(
            id as string
          );

      if (!result) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "User unblocked successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to unblock user",
      });
    }
  };

// ==========================================
// CREATE RESPONSIBLE PERSON
// ==========================================

const createResponsiblePerson =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        name,
        email,
        phone,
        institutionId,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !phone ||
        !institutionId ||
        !password
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Name, email, phone, institution ID and password are required",
        });
      }

      const result =
        await UserServices
          .createResponsiblePersonInDB({
            name,
            email,
            phone,
            institutionId,
            password,
          });

      const userObject =
        result.toObject();

      const safeUser = {
        _id:
          userObject._id,

        name:
          userObject.name,

        email:
          userObject.email,

        phone:
          userObject.phone,

        institutionId:
          userObject.institutionId,

        picture:
          userObject.picture,

        userType:
          userObject.userType,

        accountStatus:
          userObject.accountStatus,

        isEmailVerified:
          userObject.isEmailVerified,

        createdAt:
          userObject.createdAt,

        updatedAt:
          userObject.updatedAt,
      };

      return res.status(201).json({
        success: true,
        message:
          "Responsible Person created successfully",
        data: safeUser,
      });

    } catch (error: any) {

      console.error(
        "CREATE RESPONSIBLE PERSON ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Failed to create Responsible Person",
      });
    }
  };

// ==========================================
// EXPORT
// ==========================================

export const UserControllers = {

  getAllUsers,

  getSingleUser,

  getMyProfile,

  verifyProfilePassword,

  updateMyProfile,

  updateUser,

  deleteUser,

  getUsersForManagement,

  verifyUser,

  blockUser,

  unblockUser,

  createResponsiblePerson,
};