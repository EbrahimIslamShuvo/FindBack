import {
  Types,
} from "mongoose";
import Claim from "./claim.model.js";
import Post from "../Post/post.model.js";
import { User } from "../User/user.model.js";

const createClaim = async (
  userId: string,
  postId: string,
  claimerImage: string,
  proofDocument: string
) => {
  if (
    !Types.ObjectId.isValid(
      postId
    )
  ) {

    throw new Error(
      "Invalid post ID."
    );

  }

  const post =
    await Post.findById(
      postId
    );
  if (!post) {
    throw new Error(
      "Post not found."
    );
  }

  if (
    post.postType !== "FIND" &&
    post.postType !== "FOUND"
  ) {
    throw new Error(
      "Only found products can be claimed."
    );
  }

  if (
    post.status !== "ACTIVE"
  ) {
    throw new Error(
      "This product is no longer available for claim."
    );

  }

  if (
    String(post.userId) ===
    String(userId)
  ) {
    throw new Error(
      "You cannot claim your own post."
    );
  }

  const existingClaim =
    await Claim.findOne({
      postId:
        new Types.ObjectId(
          postId
        ),
      claimerId:
        new Types.ObjectId(
          userId
        ),
    });

  if (existingClaim) {
    throw new Error(
      "You have already submitted a claim for this product."
    );
  }

  const claim =
    await Claim.create({
      postId:
        new Types.ObjectId(
          postId
        ),
      claimerId:
        new Types.ObjectId(
          userId
        ),
      claimerImage,
      proofDocument,
      status:
        "PENDING",
    });

  return Claim
    .findById(
      claim._id
    )
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    );
};

const getMyClaims = async (
  userId: string
) => {
  return Claim
    .find({
      claimerId:
        new Types.ObjectId(
          userId
        ),
    })
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    )
    .sort({
      createdAt: -1,
    });
};

const getClaimById = async (
  claimId: string
) => {
  if (
    !Types.ObjectId.isValid(
      claimId
    )
  ) {
    throw new Error(
      "Invalid claim ID."
    );
  }

  const claim =
    await Claim
      .findById(
        claimId
      )
      .populate(
        "claimerId",
        "name email phone institutionId picture"
      )
      .populate(
        "postId"
      )
      .populate(
        "responsiblePersonId",
        "name email phone institutionId picture"
      );

  if (!claim) {
    throw new Error(
      "Claim not found."
    );
  }

  return claim;
};


const getAllClaims = async () => {
  return Claim
    .find()
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    )
    .sort({
      createdAt: -1,
    });
};

const getPendingClaims = async () => {
  return Claim
    .find()
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    )
    .sort({
      createdAt: -1,
    });
};

const initialApproveClaim = async (
  claimId: string,
  responsiblePersonId: string,
  remark = ""
) => {
  const claim =
    await Claim.findById(
      claimId
    );
  if (!claim) {
    throw new Error(
      "Claim not found."
    );
  }

  if (
    claim.status !== "PENDING" &&
    claim.status !== "INITIAL_REJECTED"
  ) {
    throw new Error(
      "Only pending or initially rejected claims can be approved."
    );
  }

  const responsiblePerson =
    await User.findById(
      responsiblePersonId
    );
  if (
    !responsiblePerson ||
    responsiblePerson.userType !==
      "RESPONSIBLE_PERSON"
  ) {
    throw new Error(
      "Invalid responsible person."
    );
  }

  claim.status =
    "INITIAL_APPROVED";

  claim.responsiblePersonId =
    new Types.ObjectId(
      responsiblePersonId
    );

  claim.initialRemark =
    remark?.trim() || "";

  claim.initialApprovedAt =
    new Date();

  claim.initialRejectedAt =
    undefined;

  claim.rejectionReason =
    undefined;

  await claim.save();

  await Post.findByIdAndUpdate(
    claim.postId,
    {
      status:
        "CLAIMED",
    }
  );

  const claimer =
    await User.findById(
      claim.claimerId
    );
  return {
    claim:
      await Claim
        .findById(
          claim._id
        )
        .populate(
          "claimerId",
          "name email phone institutionId picture"
        )
        .populate(
          "postId"
        )
        .populate(
          "responsiblePersonId",
          "name email phone institutionId picture"
        ),
    claimer,
  };
};

const initialRejectClaim = async (
  claimId: string,
  responsiblePersonId: string,
  reason: string
) => {
  const claim =
    await Claim.findById(
      claimId
    );
  if (!claim) {
    throw new Error(
      "Claim not found."
    );
  }

  if (
    claim.status !== "PENDING"
  ) {
    throw new Error(
      "Only pending claims can be initially rejected."
    );
  }

  if (
    !reason?.trim()
  ) {
    throw new Error(
      "Rejection reason is required."
    );
  }

  claim.status =
    "INITIAL_REJECTED";

  claim.responsiblePersonId =
    new Types.ObjectId(
      responsiblePersonId
    );

  claim.rejectionReason =
    reason.trim();

  claim.initialRejectedAt =
    new Date();

  await claim.save();

  return Claim
    .findById(
      claim._id
    )
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    );
};

const startPhysicalVerification = async (
  claimId: string,
  responsiblePersonId: string
) => {

  const claim =
    await Claim.findById(
      claimId
    );
  if (!claim) {
    throw new Error(
      "Claim not found."
    );
  }

  if (
    claim.status !==
    "INITIAL_APPROVED"
  ) {
    throw new Error(
      "Claim must be initially approved first."
    );
  }

  if (
    String(
      claim.responsiblePersonId
    ) !==
    String(
      responsiblePersonId
    )
  ) {
    throw new Error(
      "You are not assigned to this claim."
    );
  }

  claim.status =
    "PHYSICAL_VERIFICATION";

  claim.physicalVerificationAt =
    new Date();

  await claim.save();

  return Claim
    .findById(
      claim._id
    )
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    );
};

const physicalRejectClaim = async (
  claimId: string,
  responsiblePersonId: string,
  reason: string
) => {

  const claim =
    await Claim.findById(
      claimId
    );
  if (!claim) {
    throw new Error(
      "Claim not found."
    );
  }

  if (
    claim.status !==
    "PHYSICAL_VERIFICATION"
  ) {
    throw new Error(
      "Claim must be in physical verification before rejection."
    );
  }

  if (
    String(
      claim.responsiblePersonId
    ) !==
    String(
      responsiblePersonId
    )
  ) {
    throw new Error(
      "You are not assigned to this claim."
    );
  }

  if (
    !reason?.trim()
  ) {
    throw new Error(
      "Rejection reason is required."
    );
  }
  claim.status =
    "REJECTED"; 

  claim.rejectionReason =
    reason.trim(); 

  await claim.save();  

  await Post.findByIdAndUpdate(

    claim.postId, 
    {
      status:
        "ACTIVE",
    } 
  ); 

  return Claim 
    .findById(
      claim._id
    )
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    );
};

const completeClaim = async (
  claimId: string,
  responsiblePersonId: string,
  responsibleDocument: string,
  responsibleStudentIdCard: string,
  remark = ""
) => {
  const claim =
    await Claim.findById(
      claimId
    );
  if (!claim) {
    throw new Error(
      "Claim not found."
    );
  }

  if (
    claim.status !==
    "PHYSICAL_VERIFICATION"
  ) {
    throw new Error(
      "Claim is not ready for physical verification."
    );
  }

  if (
    String(
      claim.responsiblePersonId
    ) !==
    String(
      responsiblePersonId
    )
  ) {
    throw new Error(
      "You are not assigned to this claim."
    );
  }

  if (
    !responsibleDocument
  ) {
    throw new Error(
      "Responsible person's verification document is required."
    );
  }

  if (
    !responsibleStudentIdCard
  ) {
    throw new Error(
      "Responsible person's student ID card is required."
    );
  }

  claim.responsibleDocument =responsibleDocument;
  claim.responsibleStudentIdCard =responsibleStudentIdCard;
  claim.physicalVerificationRemark =remark?.trim() || "";
  claim.physicalVerificationAt = new Date();

  claim.status ="COMPLETED";
  claim.completedAt =new Date();
  await claim.save();

  await Post.findByIdAndUpdate(
    claim.postId,
    {
      status:
        "RETURNED",
    }
  );

  return Claim
    .findById(
      claim._id
    )
    .populate(
      "claimerId",
      "name email phone institutionId picture"
    )
    .populate(
      "postId"
    )
    .populate(
      "responsiblePersonId",
      "name email phone institutionId picture"
    );
};

export const claimService = {
  createClaim,
  getMyClaims,
  getClaimById,
  getAllClaims,
  getPendingClaims,
  initialApproveClaim,
  initialRejectClaim,
  startPhysicalVerification,
  physicalRejectClaim,
  completeClaim,
};