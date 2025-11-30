import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
// import { User } from "../../models/admin/user";
import User from "../../models/user.model";

const SECRET_KEY = process.env.SECRET_KEY!;

// -------------------------------
// 🧠 ADMIN AUTH LOGIC
// -------------------------------

export async function registerAdmin(email: string, password: string, name: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already in use");

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashPassword, role: "admin", name });

  return user;
}

export async function loginAdmin(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  return { token, user };
}