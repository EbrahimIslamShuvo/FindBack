import { Document, Types } from "mongoose";

export type ClaimStatus =
  | "PENDING"
  | "INITIAL_APPROVED"
  | "INITIAL_REJECTED"
  | "PHYSICAL_VERIFICATION"
  | "COMPLETED"
  | "REJECTED";

export interface IClaim extends Document {
  postId: Types.ObjectId;
  claimerId: Types.ObjectId;
  claimerImage: string;
  proofDocument: string;
  status: ClaimStatus;
  responsiblePersonId?: Types.ObjectId;
  responsibleDocument?: string;
  responsibleStudentIdCard?: string;
  initialRemark?: string;
  physicalVerificationRemark?: string;
  rejectionReason?: string;
  initialApprovedAt?: Date;
  initialRejectedAt?: Date;
  physicalVerificationAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}