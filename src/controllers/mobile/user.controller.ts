import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  getUserById,
  updateUserData,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../services/mobile/user.services";
import { ApiError } from "../../utils/ApiError";

import fs from "fs";
import path from "path";
import { cloudinary } from "../../../cloudinary";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("getUser");
  try {
    if (!req.user || !("id" in req.user)) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const user = await getUserById(req.user.id);
    res
      .status(200)
      .json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    const updateData = { ...req.body };

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "profiles",
        resource_type: "image",
        public_id: `profile-${req.user!.id}-${Date.now()}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      });

      updateData.profilePicture = result.secure_url;
      fs.unlinkSync(file.path); // Remove local file
    }

    const updatedUser = await updateUserData(req.user!.id, updateData);
    res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const addUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const addresses = await addAddress(req.user!.id, req.body);
    res
      .status(201)
      .json(new ApiResponse(201, addresses, "Address added successfully"));
  } catch (error) {
    next(error);
  }
};

export const removeUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { addressId } = req.params;
    const addresses = await deleteAddress(req.user!.id, addressId);
    res
      .status(200)
      .json(new ApiResponse(200, addresses, "Address removed successfully"));
  } catch (error) {
    next(error);
  }
};

export const setPrimaryAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { addressId } = req.params;
    const addresses = await setDefaultAddress(req.user!.id, addressId);
    res
      .status(200)
      .json(
        new ApiResponse(200, addresses, "Primary address set successfully")
      );
  } catch (error) {
    next(error);
  }
};
