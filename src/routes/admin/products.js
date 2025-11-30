const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/admin/authenticate");
const validateBody = require("../../middlewares/admin/validateBody");
const { uploadMultipleMedia } = require("../../middlewares/product.middleware");
const { schemas } = require("../../models/product");
const {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/admin/products");

router.get("/", authenticate, getAllProducts);

router.post(
  "/create",
  authenticate,
  // validateBody(schemas.addProductSchema),
  uploadMultipleMedia.array("images", 6),
  addProduct
  // (req, res) => {
  //   console.log("req body", req.body)
  // }
);

router.put(
  "/:_id",
  authenticate,
  uploadMultipleMedia.array("images", 6),
  // validateBody(schemas.editProductSchema),
  updateProduct
);

router.delete("/:_id", authenticate, deleteProduct);

module.exports = router;
