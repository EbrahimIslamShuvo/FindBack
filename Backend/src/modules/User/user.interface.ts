import { Document } from "mongoose";

// ==========================================
// USER TYPE
// ==========================================

export type UserType =
  | "USER"
  | "RESPONSIBLE_PERSON"
  | "ADMIN";

// ==========================================
// ACCOUNT STATUS
// ==========================================

export type AccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "BLOCKED";

// ==========================================
// USER INTERFACE
// ==========================================

export interface IUser extends Document {
  name: string;

  email: string;

  password: string;

  phone: string;

  institutionId: string;

  picture?: string;

  userType: UserType;

  accountStatus: AccountStatus;

  isEmailVerified: boolean;

  otp?: string;

  otpExpiresAt?: Date;

  createdAt?: Date;

  updatedAt?: Date;
}