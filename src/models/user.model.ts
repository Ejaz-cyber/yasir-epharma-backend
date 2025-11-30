import mongoose, { Document, Schema } from "mongoose";

// ---------------- Types ----------------
export interface IUser extends Document {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "admin" | "user";
  token?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---------------- Schema ----------------
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },

    // Admin users: required; mobile users: optional
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },

    // Mobile users: required; admin users: optional
    phone: {
      type: String,
      required: false,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    token: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// ---------------- Indexes ----------------

// Unique phone (but allow multiple nulls)
UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

// Unique email (but allow multiple nulls)
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

// ---------------- Model ----------------
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
