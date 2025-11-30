import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError";
import {
  createOrderService,
  fetchAllOrders,
  fetchOrderById,
  updateOrderService,
} from "../../services/order.service";
import { ApiResponse } from "../../utils/ApiResponse";

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const orders = await fetchAllOrders(userId);
    res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const orderId = req.params.id;
    if (!orderId) throw new ApiError(400, "Order id is required");

    const order = await fetchOrderById(orderId);
    res
      .status(200)
      .json(new ApiResponse(200, order, "Order fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const order = await updateOrderService(id, req.user?.id!, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, order, "Order updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await createOrderService(req.user?.id!, req.body);

    res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    next(error);
  }
};
