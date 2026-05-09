import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  phone: string;
  otp: string;
  createdAt: Date;
  expired: boolean;
}

const OtpSchema: Schema = new Schema<IOtp>({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // expires in 5 mins
  expired: { type: Boolean, default: false },
});

export default mongoose.model<IOtp>("Otp", OtpSchema);
