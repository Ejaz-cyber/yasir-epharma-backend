import mongoose, { Document, Schema } from "mongoose";
import {  ICancelOrder, IDelivery, IOrder, IOrderItem, IPriceBreakdown, OrderStatus, PaymentType, UserRole } from "../types";

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const priceBreakdownSchema = new Schema<IPriceBreakdown>(
  {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const cancelOrderSchema = new Schema<ICancelOrder>(
  {
    reason: { type: String, required: true },
    cancelAt: { type: Date, required: true },
    userRole: { type: String, enum: Object.values(UserRole), required: true },
  },
  { _id: false }
);


const deliverySchema = new Schema<IDelivery>(
  {
    fullName: { type: String, required: true },
    fullAddress: { type: String, required: true },
    pincode: { type: String, required: true },
    cityTown: { type: String, required: true },
    coordinates:  {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
    deliveredAt: { type: Date, required: false },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    priceBreakdown: { type: priceBreakdownSchema, required: false },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentType),
      default: PaymentType.CASH_ON_DELIVERY,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    cancel: { type: cancelOrderSchema, required: false },
    delivery: { type: deliverySchema, required: true },
  },
  { timestamps: true, versionKey: false }
);

// ---------------- Model ----------------
export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
