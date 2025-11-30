import { Router } from "express";
import { validateToken } from "../../middlewares/mobile/auth.middleware";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../../controllers/admin/orders.controller";
import { authenticate } from "../../middlewares/admin";

const router = Router();

router.route("/get-all").get(authenticate, getAllOrders);
router.route("/:id").get(authenticate, getOrderById);
router.patch("/:id", authenticate, updateOrder);
// router.post("/", authenticate, createOrder);

export default router;
