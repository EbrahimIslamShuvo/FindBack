import {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt from "jsonwebtoken";

// JWT PAYLOAD
export interface JwtPayload {
  id: string;
  email: string;
  userType:
  | "USER"
  | "RESPONSIBLE_PERSON"
  | "ADMIN";
}

// AUTH MIDDLEWARE
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // GET AUTHORIZATION HEADER
    const authHeader =
      req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token is required",
      });
    }

    // CHECK BEARER TOKEN
    if (
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }

    // GET TOKEN
    const token =
      authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization token",
      });
    }

    // GET JWT SECRET
    const secret =
      process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      console.error(
        "JWT_ACCESS_SECRET is missing from .env"
      );
      return res.status(500).json({
        success: false,
        message:
          "JWT secret is missing",
      });
    }

    // VERIFY TOKEN
    const decoded =
      jwt.verify(
        token,
        secret
      ) as JwtPayload;

    // CHECK PAYLOAD
    if (
      !decoded.id ||
      !decoded.email ||
      !decoded.userType
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token payload",
      });
    }

    // SAVE USER IN REQUEST
    (req as any).user =
      decoded;

    // NEXT
    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

// ROLE AUTHORIZATION
export const authorizeRoles =
  (
    ...allowedRoles: Array<
      "USER" |
      "RESPONSIBLE_PERSON" |
      "ADMIN"
    >
  ) => {
    return (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // GET LOGGED-IN USER
        const user =
          (req as any).user as JwtPayload | undefined;
        if (!user) {
          return res.status(401).json({
            success: false,
            message:
              "User is not authenticated",
          });
        }

        // CHECK USER TYPE
        if (
          !allowedRoles.includes(
            user.userType
          )
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You do not have permission to perform this action",
          });
        }
        next();
      } catch (error) {
        console.error(
          "ROLE AUTHORIZATION ERROR:",
          error
        );
        return res.status(403).json({
          success: false,
          message:
            "Access denied",
        });
      }
    };
  };


export default authMiddleware;