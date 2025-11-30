// import User from "../../models/mobile/User";
import User from "../../models/user.model";
import { ApiError } from "../../utils/ApiError";

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

export async function updateUserData(
  id: string,
  data: { name?: string; email?: string }
) {
  const updateData: any = {};

  if (data.name) {
    const name = data.name.trim();
    if (name.length <= 3)
      throw new ApiError(400, "Name must be more than 3 characters");
    updateData.name = name;
  }

  if (data.email) {
    const email = data.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      throw new ApiError(400, "Invalid email address");

    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) throw new ApiError(409, "Email already in use");

    updateData.email = email;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) throw new ApiError(404, "User not found");

  return updatedUser;
}
