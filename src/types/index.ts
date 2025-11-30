import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { IUser } from "../models/user.model";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IGetOtpRequest {
  phone: string;
}
export interface IValidateOtpRequest {
  phone: string;
  otp: string;
  deviceName?: string;
  deviceId?: string;
}
export interface IRegisterRequest {
  name: string;
  phone: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface JwtUserPayload extends JwtPayload {
  id: string;
  phone?: string;
}

export interface IOrderItem {
  productId: Types.ObjectId; // Reference to Product
  quantity: number;
}

export interface IPriceBreakdown {
  subtotal: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  total: number;
}

export interface ICancelOrder {
  reason: string;
  cancelAt: Date;
  userRole: string;
}

export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentType {
  CASH_ON_DELIVERY = "cash_on_delivery",
  ONLINE = "online",
}

export interface IOrder extends Document {
  userId: Types.ObjectId; // Reference to User
  items: IOrderItem[];
  priceBreakdown?: IPriceBreakdown;
  paymentMethod: PaymentType;
  status: OrderStatus;
  cancel?: ICancelOrder;
  createdAt: Date;
  updatedAt: Date;
  delivery: IDelivery;
}

export interface IDelivery {
  fullName: string;
  fullAddress: string;
  pincode: string;
  cityTown: string; // city or town
  coordinates?: ICoordinates;
  deliveredAt: Date;
  phone: string;
}

interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IOrderResponse {
  _id: string;
  user: Pick<IUser, "name" | "email" | "phone" | "role" | "profilePicture">; // selected fields
  items: IProductResponse[];
  priceBreakdown: IPriceBreakdown;
  paymentMethod: PaymentType;
  status: OrderStatus;
  delivery: IDelivery;
  createdAt: Date;
  updatedAt?: Date;
}

export const PRODUCT_CATEGORY_ENUM = [
  "Medicine",
  "Head",
  "Hand",
  "Dental Care",
  "Skin Care",
  "Eye Care",
  "Vitamins & Supplements",
  "Leg",
  "Baby Care",
  "Heart",
];

export interface IProductImage {
  url: string;
  public_id?: string | null;
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  images: IProductImage[];
  price: number;
  discount?: number; // percentage, e.g., 10 for 10%
  stock?: number;
  category: string;
  isFeatured?: boolean;
  isActive?: boolean;
  outOfStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductResponse extends IProduct {
  quantity: number;
}
