import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  getUserById,
  updateUserData,
} from "../../services/mobile/user.services";
import { ApiError } from "../../utils/ApiError";

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
    const updatedUser = await updateUserData(req.user!.id, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
  } catch (error) {
    next(error);
  }
};
