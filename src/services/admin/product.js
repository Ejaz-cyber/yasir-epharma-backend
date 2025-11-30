const { Product } = require("../../models/product");

const getAllProducts = async (search, page, limit) => {
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const skip = (page - 1) * limit;

  const [products, total, categories] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }), // latest first
    Product.countDocuments(filter),
    Product.distinct("category"),
  ]);

  return {
      products,
      categories,
      pagination: {
        totalItems: Number(total),
        totalPages: Math.ceil(total / limit),
        page: Number(page),
        limit: Number(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      }

    }
};

async function addProduct(data) {
  const { name } = data;
  const existing = await Product.findOne({ name });
  if (existing) {
    throw new Error("Product with this name already exists");
  }
  const product = new Product(data);
  await product.save();
  return product;
}

async function updateProduct(id, data) {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  // ✅ Check for unique product name
  if (data.name) {
    const existing = await Product.findOne({ name: data.name });
    if (existing && existing._id.toString() !== id) {
      throw new Error("Product with this name already exists");
    }
  }

  // ✅ Merge all updates (images already appended in controller)
  Object.assign(product, data);
  await product.save();

  return product;
}

async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  await Product.findByIdAndDelete(id);
  return "Product deleted successfully";
}

async function getProductById(id) {
  return await Product.findById(id);
}

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};

