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
  data: { name?: string; email?: string; profilePicture?: string }
) {
  const updateData: any = {};

  if (data.name) {
    const name = data.name.trim();
    if (name.length < 3)
      throw new ApiError(400, "Name must be at least 3 characters long");
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

  if (data.profilePicture) {
    updateData.profilePicture = data.profilePicture;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) throw new ApiError(404, "User not found");

  return updatedUser;
}

export async function addAddress(userId: string, address: any) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.addresses) user.addresses = [];

  // If it's the first address, make it default
  if (user.addresses.length === 0) {
    address.isDefault = true;
  } else if (address.isDefault) {
    // If setting new address as default, unset others
    user.addresses.forEach((addr: any) => (addr.isDefault = false));
  }

  user.addresses.push(address);
  await user.save();
  return user.addresses;
}

export async function deleteAddress(userId: string, addressId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.addresses) return [];

  user.addresses = user.addresses.filter(
    (addr: any) => addr._id.toString() !== addressId
  );
  await user.save();
  return user.addresses;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.addresses) throw new ApiError(404, "No addresses found");

  let found = false;
  user.addresses.forEach((addr: any) => {
    if (addr._id.toString() === addressId) {
      addr.isDefault = true;
      found = true;
    } else {
      addr.isDefault = false;
    }
  });

  if (!found) throw new ApiError(404, "Address not found");

  await user.save();
  return user.addresses;
}
