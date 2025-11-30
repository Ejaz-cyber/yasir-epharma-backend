import { Request, Response, NextFunction } from "express";
import { generateOtp, verifyOtp, refreshAccessToken } from "../../services/mobile/auth.service";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

export const getOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, "Phone is required");

    const otp = await generateOtp(phone);
    console.log(`Generated OTP for ${phone}: ${otp}`);

    res.status(201).json(new ApiResponse(201, null, "OTP sent"));
  } catch (err) {
    next(err);
  }
};

export const verifyOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp, deviceName, deviceId } = req.body;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const { accessToken, refreshToken } = await verifyOtp(
      phone,
      otp,
      deviceName,
      deviceId,
      ip,
      userAgent
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "OTP verified successfully")
      );
  } catch (err: any) {
    next(new ApiError(400, err.message));
  }
};

export const refreshAccessTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken, deviceId } = req.body;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const newAccessToken = await refreshAccessToken(refreshToken, deviceId, ip, userAgent);

    res
      .status(200)
      .json(new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed"));
  } catch (err: any) {
    next(err);
  }
};
