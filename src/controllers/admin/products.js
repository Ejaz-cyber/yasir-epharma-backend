const fs = require("fs");
const path = require("path");
// const cloudinary = require("../../../cloudinary");
const { cloudinary } = require("../../../cloudinary");

const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ctrlWrapper } = require("../../helpers");
const ProductService = require("../../services/admin/product");

// ---------------- GET ALL ----------------
const getAllProducts = async (req, res) => {
 const { search, page = 1, limit = 10 } = req.query;
  const data = await ProductService.getAllProducts(search, Number(page), Number(limit));
  res.json(new ApiResponse(200, data, "Products fetched successfully"));
};

// ---------------- ADD PRODUCT ----------------
const addProduct = async (req, res, next) => {
  try {
    const files = req.files;
    console.log("🚀 ~ addProduct ~ files:", files)
    const productData = req.body;
    console.log("🚀 ~ addProduct ~ productData:", productData)

    

    if (!files || files.length === 0) {
      return next(new ApiError(400, "At least one product image is required"));
    }

    const uploadedImages = [];
    console.log("🚀 ~ addProduct ~ cloudinary:", cloudinary.uploader)

    for (const file of files) {
      console.log("🚀 ~ addProduct ~ file.path:", file.path)
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "meds",
        resource_type: "image",
        public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      });
      console.log("🚀 ~ addProduct ~ result:", result)
      

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });

      fs.unlinkSync(file.path);
    }

    productData.images = uploadedImages;
    console.log("🚀 ~ addProduct ~ uploadedImages:", uploadedImages)
    
    const product = await ProductService.addProduct(productData);
    console.log("🚀 ~ addProduct ~ product:", product)
    res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  } catch (err) {
    next(err);
  }
};

// ---------------- UPDATE PRODUCT ----------------
const updateProduct = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const files = req.files;
    const productData = req.body;

    // Fetch existing product to get current images
    const product = await ProductService.getProductById(_id);
    if (!product) return next(new ApiError(404, "Product not found"));

    // Start with existing images
    const existingImages = product.images || [];
    const uploadedImages = [...existingImages];

    // Upload new images and append
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          resource_type: "image",
          public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        });

        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });

        fs.unlinkSync(file.path);
      }
    }

    // Merge the images with productData
    productData.images = uploadedImages;

    // Update the product
    const updatedProduct = await ProductService.updateProduct(_id, productData);

    res
      .status(200)
      .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
  } catch (err) {
    next(err);
  }
};

// ---------------- DELETE PRODUCT ----------------
const deleteProduct = async (req, res) => {
  const { _id } = req.params;
  const message = await ProductService.deleteProduct(_id);
  res.json(new ApiResponse(200, null, message));
};

module.exports = {
  getAllProducts: ctrlWrapper(getAllProducts),
  addProduct: ctrlWrapper(addProduct),
  updateProduct: ctrlWrapper(updateProduct),
  deleteProduct: ctrlWrapper(deleteProduct),
};
