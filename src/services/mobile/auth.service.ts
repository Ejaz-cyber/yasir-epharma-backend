import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import Otp from "../../models/mobile/Otp";
import { ApiError } from "../../utils/ApiError";
// import User from "../../models/mobile/User";
import User from "../../models/user.model";
import Session from "../../models/mobile/Session";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function generateOtp(phone: string) {
  await Otp.deleteMany({ phone });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ phone, otp });

  return otp;
}

export async function verifyOtp(phone: string, otp: string, deviceName?: string, deviceId?: string, ip?: string, userAgentHeader?: string) {
  const otpDoc = await Otp.findOne({ phone, otp, expired: false });
  if (!otpDoc) throw new ApiError(400, "Invalid or expired OTP");

  otpDoc.expired = true;
  await otpDoc.save();

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone, role: "user" });

  const accessToken = jwt.sign({ id: user._id, phone }, JWT_ACCESS_SECRET, { expiresIn: "4h" });
  const refreshToken = jwt.sign({ id: user._id, phone }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

  const ua = new UAParser(userAgentHeader || "").getResult();

  await Session.create({
    user: user._id,
    refreshToken,
    ip,
    userAgent: {
      raw: userAgentHeader || "",
      browser: ua.browser.name || "Unknown",
      os: ua.os.name || "Unknown",
      device: ua.device.model || "Unknown",
    },
    deviceName,
    deviceId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken, user };
}

export async function refreshAccessToken(refreshToken: string, deviceId?: string, ip?: string, userAgentHeader?: string) {
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  const session = await Session.findOne({ refreshToken });
  if (!session) throw new ApiError(401, "Invalid refresh token");

  if (session.deviceId && deviceId && session.deviceId !== deviceId)
    throw new ApiError(401, "Invalid device ID");

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  if (session.expiresAt < new Date())
    throw new ApiError(401, "Session expired, please log in again");

  const ua = new UAParser(userAgentHeader || "").getResult();
  const matchesDevice =
    session.userAgent.browser === (ua.browser.name || "Unknown") &&
    session.userAgent.os === (ua.os.name || "Unknown");

  if (!matchesDevice) throw new ApiError(401, "Device information mismatch");

  if (session.ip !== ip) {
    session.ip = ip || "Unknown";
    await session.save();
  }

  const newAccessToken = jwt.sign(
    { id: decoded.id, phone: decoded.phone },
    JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  return newAccessToken;
}
