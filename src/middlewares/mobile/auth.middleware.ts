import { ApiError } from "../../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
// import User from "../../models/mobile/User";
import User from "../../models/user.model";
import { JwtUserPayload } from "../../types";
import { NextFunction, Request, Response } from "express";


// ✅ Validate Phone Number
export function validatePhone(req: Request, res: Response, next: NextFunction) {
  const { phone } = req.body as { phone: string };

  if (!phone) {
    return res.status(400).json({ msg: "Phone number is required" });
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid mobile number" });
  }

  next();
}

// ✅ Validate OTP
export function validateOtp(req: Request, res: Response, next: NextFunction) {
  const { otp } = req.body as { otp: string };
  if (!otp) {
    return res.status(400).json({ message: "Otp is required" });
  }

  if (otp.length !== 6) {
    return res.status(400).json({
      message: "Otp should be 6 digits long",
    });
  }

  next();
}

// ✅ Validate JWT Token
export function validateToken(req: Request, res: Response, next: NextFunction) {
  console.log("-------validating token-------");

  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Unauthorized request"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JwtPayload | string;

    // Ensure it’s a valid object payload
    if (typeof decoded === "string" || !("id" in decoded)) {
      return next(new ApiError(401, "Invalid token payload"));
    }

    // ✅ Safe type-casting to your custom payload
    req.user = decoded as JwtUserPayload;

    console.log("-------validating token complete-------");
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}
