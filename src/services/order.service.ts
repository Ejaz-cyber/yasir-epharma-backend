import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { Order } from "../models/order.model";
import User from "../models/user.model";
import {
  IOrder,
  IOrderItem,
  IOrderResponse,
  IPriceBreakdown,
  IProduct,
  IProductResponse,
  OrderStatus,
  PaymentType,
  UserRole,
} from "../types";
import { ApiError } from "../utils/ApiError";
import { Product } from "../models/product";

export const fetchAllOrders = async (
  userId: string,
  role: UserRole = UserRole.USER,
  search: string = "",
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  // USER FLOW ✅
  if (role === UserRole.USER) {
    const filter: FilterQuery<any> = { userId };

    if (search) {
      filter.$or = [
        { "delivery.name": { $regex: search, $options: "i" } },
        { "delivery.fullAddress": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone profilePicture")
      .populate("items.productId", "name price discount stock category images")
      .lean();

    const mappedOrders = orders.map((order: any) => {
      if (order.items) {
        order.items = order.items.map((item: any) => ({
          ...item,
          product: item.productId,
          productId: item.productId?._id || item.productId,
        }));
      }
      return order;
    });

    return {
      orders: mappedOrders,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // ADMIN FLOW — Aggregation Pipeline
  const matchStage: any = {};

  if (search) {
    matchStage.$or = [
      // { "productDetails.name": { $regex: search, $options: "i" } },
      { "userInfo.name": { $regex: search, $options: "i" } },
      { "delivery.fullName": { $regex: search, $options: "i" } },
      { "delivery.fullAddress": { $regex: search, $options: "i" } },
    ];
  }

  const basePipeline: PipelineStage[] = [
    // ---------------------------
    // Fetch USER and limit fields
    // ---------------------------
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              _id: 1,
              name: 1,
              phone: 1,
              email: 1,
              role: 1,
              createdAt: 1,
            },
          },
        ],
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },

    // ---------------------------
    // Fetch PRODUCTS for all items
    // ---------------------------
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productsData",
      },
    },

    // ---------------------------
    // Merge products into items[]
    // ---------------------------
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "item",
            in: {
              quantity: "$$item.quantity",
              product: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$productsData",
                      as: "p",
                      cond: { $eq: ["$$p._id", "$$item.productId"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    // Remove temporary data
    { $project: { productsData: 0 } },
  ];

  const pipeline: PipelineStage[] = [
    ...basePipeline,
    ...(search ? [{ $match: matchStage }] : []),
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const countPipeline: PipelineStage[] = [
    ...basePipeline,
    ...(search ? [{ $match: matchStage }] : []),
    { $count: "total" },
  ];

  const [orders, totalArr] = await Promise.all([
    Order.aggregate(pipeline),
    Order.aggregate(countPipeline),
  ]);

  const total = totalArr?.[0]?.total ?? 0;

  return {
    orders,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const fetchOrderById = async (orderId: string) => {
  const order = await Order.findById(orderId)
    .populate("userId", "name email phone profilePicture")
    .populate("items.productId", "name price images category")
    .lean();

  if (order && order.items) {
    order.items = order.items.map((item: any) => ({
      ...item,
      product: item.productId,
      productId: item.productId?._id || item.productId,
    }));
  }

  return order;
};

export async function updateOrderService(
  orderId: string,
  userId: string,
  data: any
) {
  const { status, cancelReason } = data;

  // Fetch order with ownership check
  const order = await Order.findOne({ _id: orderId });
  console.log("order", order);
  if (!order) throw new ApiError(404, "Order not found");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Prevent updating finished orders
  if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
    throw new ApiError(
      400,
      `Cannot update an order that is already ${order.status}`
    );
  }

  if (!status) throw new ApiError(400, "Status is required");

  // Valid transition map
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  const allowedNext = validTransitions[order.status as OrderStatus];
  if (!allowedNext.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status change from "${order.status}" to "${status}"`
    );
  }

  // Handle cancellation
  if (status === OrderStatus.CANCELLED) {
    if (!cancelReason) {
      throw new ApiError(400, "Cancel reason is required");
    }

    order.cancel = {
      reason: cancelReason,
      cancelledAt: new Date(),
      byRole: user.role,
    };
  }

  // Apply new status
  order.status = status;

  // Add delivery timestamp
  if (status === OrderStatus.DELIVERED) {
    order.delivery = {
      ...(order.delivery || {}),
      deliveredAt: new Date(),
    };
  }

  await order.save();

  return order;
}

export const createOrderService = async (
  userId: string,
  data: IOrder
): Promise<IOrderResponse> => {
  const { items, paymentMethod, delivery } = data;

  if (!items || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    let prescriptionRequired = false;
    const orderItems: IOrderItem[] = [];
    const productInfos: IProductResponse[] = []; // store product info for response

    // 1️⃣ Validate products & calculate subtotal
    for (const item of items) {
      if (!item.productId) {
        throw new ApiError(400, "Product ID is required");
      }

      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new ApiError(404, `Product not found`);
      }

      if (product.requiresPrescription) {
        prescriptionRequired = true;
      }

      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for product ${product.name}`
        );
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
      });

      // Keep product info for final response
      productInfos.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
        quantity: item.quantity,
      });
    }

    if (prescriptionRequired && !data.prescriptionImage) {
      throw new ApiError(
        400,
        "Prescription is required for one or more items in your order"
      );
    }

    // 2️⃣ Calculate price breakdown
    const discount = 0; // e.g., coupon system can update later
    const tax = subtotal * 0.05; // 5% example tax
    const shipping = 50; // flat rate
    const total = subtotal - discount + tax + shipping;

    const priceBreakdown: IPriceBreakdown = {
      subtotal,
      discount,
      tax,
      shipping,
      total,
    };

    // 3️⃣ Create new order document
    const order = new Order({
      userId,
      items: orderItems,
      priceBreakdown,
      paymentMethod: paymentMethod || PaymentType.CASH_ON_DELIVERY,
      status: OrderStatus.PENDING,
      delivery,
      prescriptionImage: data.prescriptionImage,
    });

    await order.save({ session });

    // 4️⃣ Decrease product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // 5️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    const userInfo = await User.findById(userId);

    // 6️⃣ Build response using stored product info

    const response: IOrderResponse = {
      _id: order._id.toString(),
      user: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        profilePicture: userInfo.profilePicture,
      },
      status: order.status,
      paymentMethod: order.paymentMethod,
      priceBreakdown,
      delivery,
      createdAt: order.createdAt,
      items: productInfos,
    };

    return response;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
