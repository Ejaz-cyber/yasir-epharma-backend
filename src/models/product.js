const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");
const { PRODUCT_CATEGORY_ENUM } = require("../types");



// ---------------- Mongoose Schema ----------------
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String }, // for Cloudinary or other storage IDs
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0, // percentage discount, e.g. 10 for 10%
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: PRODUCT_CATEGORY_ENUM,
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    outOfStock: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-update `outOfStock` based on `stock`
// productSchema.pre("save", function (next) {
//   this.outOfStock = this.stock <= 0;
//   next();
// });

// productSchema.post("save", handleMongooseError);

// ---------------- Joi Validation Schemas ----------------
const addProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        public_id: Joi.string().allow(null, ""),
      })
    )
    .min(1)
    .required(),
  price: Joi.number().required().min(0),
  discount: Joi.number().min(0).max(100).default(0),
  stock: Joi.number().required().min(0),
  category: Joi.string()
    .valid(...PRODUCT_CATEGORY_ENUM)
    .required(),
  isFeatured: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

const editProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow("", null),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      public_id: Joi.string().allow(null, ""),
    })
  ),
  price: Joi.number().min(0),
  discount: Joi.number().min(0).max(100),
  stock: Joi.number().min(0),
  category: Joi.string().valid(...PRODUCT_CATEGORY_ENUM),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  outOfStock: Joi.boolean(),
});

const Product = model("Product", productSchema);

const schemas = {
  addProductSchema,
  editProductSchema,
};

module.exports = { Product, schemas };
