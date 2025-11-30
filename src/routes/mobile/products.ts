import { Router } from "express";
import { validateToken } from "../../middlewares/mobile/auth.middleware";
import {
  getAllProducts,
  getProductById,
} from "../../controllers/mobile/products.controller";

const router = Router();

router.route("/").get(validateToken, getAllProducts);
router.route("/:id").get(validateToken, getProductById);

export default router;
