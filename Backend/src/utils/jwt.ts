import jwt from "jsonwebtoken";

export interface IJwtPayload {
  id: string;
  email: string;
  userType: string;
}

export const generateToken = (
  payload: IJwtPayload
): string => {

  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn =
    process.env.JWT_ACCESS_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is missing from .env"
    );
  }

  return jwt.sign(
    payload,
    secret,
    {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    }
  );
};