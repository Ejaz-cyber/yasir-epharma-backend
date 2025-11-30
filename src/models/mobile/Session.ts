import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Schema.Types.ObjectId;
  refreshToken: string;
  ip: string;
  userAgent: {
    raw: string;
    browser: string;
    os: string;
    device: string;
  };
  deviceName?: string; // Sent by client
  deviceId?: string; // Unique ID sent by client
  createdAt: Date;
  expiresAt: Date;
}

const SessionSchema: Schema = new Schema<ISession>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  refreshToken: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: {
    raw: { type: String, required: true },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
  },
  deviceName: { type: String },
  deviceId: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model<ISession>("Session", SessionSchema);
