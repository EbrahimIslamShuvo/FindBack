import {
  Schema,
  model,
} from "mongoose";

import {IClaim} from "./claim.interface.js";

const claimSchema =
  new Schema<IClaim>(
    {
      postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
      claimerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      claimerImage: {
        type: String,
        required: true,
        trim: true,
      },
      proofDocument: {
        type: String,
        required: true,
        trim: true,
      },
      status: {
        type: String,
        enum: [
          "PENDING",
          "INITIAL_APPROVED",
          "INITIAL_REJECTED",
          "PHYSICAL_VERIFICATION",
          "COMPLETED",
          "REJECTED",
        ],
        default: "PENDING",
      },
      responsiblePersonId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      responsibleDocument: {
        type: String,
        default: "",
      },
      responsibleStudentIdCard: {
        type: String,
        default: "",
      },
      initialRemark: {
        type: String,
        trim: true,
        default: "",
      },
      physicalVerificationRemark: {
        type: String,
        trim: true,
        default: "",
      },
      rejectionReason: {
        type: String,
        trim: true,
        default: "",
      },
      initialApprovedAt: {
        type: Date,
        default: null,
      },
      initialRejectedAt: {
        type: Date,
        default: null,
      },
      physicalVerificationAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

claimSchema.index({
  postId: 1,
  claimerId: 1,
});
claimSchema.index({
  status: 1,
});
claimSchema.index({
  responsiblePersonId: 1,
});

const Claim =
  model<IClaim>(
    "Claim",
    claimSchema
  );

export default Claim;