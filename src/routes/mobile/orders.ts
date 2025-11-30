import { Router } from "express";
import { validateToken } from "../../middlewares/mobile/auth.middleware";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../../controllers/mobile/orders.controller";

const router = Router();

router.route("/get-all").get(validateToken, getAllOrders);
router.route("/:id").get(validateToken, getOrderById);
// router.patch("/:id", validateToken, updateOrder);
router.post("/", validateToken, createOrder);

export default router;
