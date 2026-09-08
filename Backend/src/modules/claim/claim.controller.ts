import { Request, Response } from "express";
import { claimService } from "./claim.service.js";
import { sendEmail } from "../../utils/sendEmail.js";

const createClaim = async (
  req: Request,
  res: Response
) => {
  try{
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message:
          "User is not authenticated.",
      });
    }
    const { postId } =
      req.params;

    const files =
      req.files as {
        [fieldname: string]:
          Express.Multer.File[];
      };

    const claimerImage =
      files?.claimerImage?.[0]
        ?.filename || "";

    const proofDocument =
      files?.proofDocument?.[0]
        ?.filename || "";

    if (!claimerImage) {
      return res.status(400).json({
        success: false,
        message:
          "Claimer image is required.",
      });
    }

    if (!proofDocument) {
      return res.status(400).json({
        success: false,
        message:
          "Proof document is required.",
      });
    }

    const claim =
      await claimService.createClaim(
        user.id,
        postId as any,
        claimerImage,
        proofDocument
      );

    return res.status(201).json({
      success: true,
      message:
        "Claim submitted successfully.",
      data: claim,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create claim.",
    });
  }
};

const getMyClaims = async (
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
          "User is not authenticated.",
      });
    }

    const claims =
      await claimService.getMyClaims(
        user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "My claims fetched successfully.",
      data: claims,
    });
  }
  catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch claims.",
    });
  }
};

const getClaimById = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      claimId
    } = req.params;

    const claim =
      await claimService.getClaimById(
        claimId as any
      );

    return res.status(200).json({
      success: true,
      message:
        "Claim fetched successfully.",
      data: claim,
    });
  }

  catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        "Claim not found.",
    });
  }
};

const getAllClaims = async (
  req: Request,
  res: Response
) => {
  try {
    const claims =
      await claimService.getAllClaims();

    return res.status(200).json({
      success: true,
      message:
        "All claims fetched successfully.",
      data: claims,
    });
  }

  catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch all claims.",
    });
  }
};

const getPendingClaims = async (
  req: Request,
  res: Response
) => {
  try {
    const claims =
      await claimService.getPendingClaims();

    return res.status(200).json({
      success: true,
      message:
        "Claim requests fetched successfully.",
      data: claims,
    });
  }
  catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch claim requests.",
    });
  }
};

const initialApproveClaim = async (
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
          "User is not authenticated.",
      });
    }

    const {
      claimId
    } = req.params;

    const {
      remark
    } = req.body;

    const result =
      await claimService.initialApproveClaim(
        claimId as any,
        user.id,
        remark || ""
      );

    try {
      if (
        result.claimer?.email
      ) {
        await sendEmail({
          to:
            result.claimer.email,
          subject:
            "FindBack - Claim Initially Approved",
          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
              "
            >
              <h2>
                Claim Initially Approved
              </h2>
              <p>
                Hello
                <strong>
                  ${result.claimer.name || "User"}
                </strong>,
              </p>
              <p>
                Your claim request has been
                <strong>
                  initially approved
                </strong>
                by the responsible person.
              </p>
              <p>
                Your claim will now proceed to
                the physical verification stage.
              </p>
              ${
                remark
                  ? `
                    <p>
                      <strong>
                        Remark:
                      </strong>
                      ${remark}
                    </p>
                  `
                  : ""
              }
              <p>
                Please wait for the next update
                regarding your claim.
              </p>
              <br />
              <p>
                Regards,<br />
                <strong>
                  FindBack Team
                </strong>
              </p>
            </div>
          `,
        });
      }
    }
    catch (emailError) {
      console.error(
        "Approval email failed:",
        emailError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Claim approved successfully.",
      data:
        result.claim,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to approve claim.",
    });
  }
};

const initialRejectClaim = async (
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
          "User is not authenticated.",
      });
    }

    const {
      claimId
    } = req.params;

    const {
      reason
    } = req.body;

    if (
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required.",
      });
    }

    const claim =
      await claimService.initialRejectClaim(
        claimId as any,
        user.id,
        reason.trim()
      );

    try {
      const claimer =
        (claim as any)?.claimerId;
      
        if (
        claimer?.email
      ) {
        await sendEmail({
          to:
            claimer.email,
          subject:
            "FindBack - Claim Request Rejected",
          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
              "
            >
              <h2>
                Claim Request Rejected
              </h2>
              <p>
                Hello
                <strong>
                  ${claimer.name || "User"}
                </strong>,
              </p>
              <p>
                Your claim request has been
                <strong>
                  initially rejected
                </strong>
                by the responsible person.
              </p>
              <p>
                <strong>
                  Reason:
                </strong>
                ${reason.trim()}
              </p>
              <p>
                You may review the claim information
                and submit the claim again if the
                system allows it.
              </p>
              <br />
              <p>
                Regards,<br />
                <strong>
                  FindBack Team
                </strong>
              </p>
            </div>
          `,
        });
      }
    }
    catch (emailError) {
      console.error(
        "Initial rejection email failed:",
        emailError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Claim rejected successfully.",
      data: claim,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to reject claim.",
    });
  }
};

const startPhysicalVerification = async (
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
          "User is not authenticated.",
      });

    }

    const {
      claimId
    } = req.params;

    const claim =
      await claimService.startPhysicalVerification(
        claimId as any,
        user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Physical verification started successfully.",
      data: claim,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to start physical verification.",
    });
  }
};

const physicalRejectClaim = async (
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
          "User is not authenticated.",
      });
    }

    const {
      claimId
    } = req.params;

    const {
      reason
    } = req.body;

    if (
      !reason?.trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required.",
      });

    }

    const claim =
      await claimService.physicalRejectClaim(
        claimId as any,
        user.id,
        reason.trim()
      );

    try {
      const claimer =
        (claim as any)?.claimerId;
      if (
        claimer?.email
      ) {
        await sendEmail({
          to:
            claimer.email,
          subject:
            "FindBack - Claim Rejected After Physical Verification",
          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
              "
            >
              <h2>
                Claim Rejected
              </h2>
              <p>
                Hello
                <strong>
                  ${claimer.name || "User"}
                </strong>,
              </p>
              <p>
                Your claim has been
                <strong>
                  rejected after physical verification
                </strong>.
              </p>
              <p>
                <strong>
                  Reason:
                </strong>
                ${reason.trim()}
              </p>
              <p>
                The claimed item has been made
                available again.
              </p>
              <br />
              <p>
                Regards,<br />
                <strong>
                  FindBack Team
                </strong>
              </p>
            </div>
          `,
        });
      }
    }
    catch (emailError) {
      console.error(
        "Physical rejection email failed:",
        emailError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Claim rejected after physical verification.",
      data: claim,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to reject claim.",
    });
  }
};

const completeClaim = async (
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
          "User is not authenticated.",
      });
    }

    const {
      claimId
    } = req.params;

    const files =
      req.files as {
        [fieldname: string]:
          Express.Multer.File[];
      };

    const responsibleDocument =
      files
        ?.responsibleDocument?.[0]
        ?.filename || "";

    const responsibleStudentIdCard =
      files
        ?.responsibleStudentIdCard?.[0]
        ?.filename || "";

    const {
      remark
    } = req.body;

    if (
      !responsibleDocument
    ) {
      return res.status(400).json({
        sccess: false,
        message:
          "Responsible document is required.",
      });
    }

    if (
      !responsibleStudentIdCard
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Responsible person's student ID card is required.",
      });
    }

    const claim =
      await claimService.completeClaim(
        claimId as any,
        user.id,
        responsibleDocument,
        responsibleStudentIdCard,
        remark || ""
      );

    return res.status(200).json({
      success: true,
      message:
        "Claim completed successfully.",
      data: claim,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to complete claim.",
    });
  }
};

export {
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
