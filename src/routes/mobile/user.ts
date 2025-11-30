import { Router } from "express";
import { getUser, updateUser } from "../../controllers/mobile/user.controller";
import { validateToken } from "../../middlewares/mobile/auth.middleware";

const router = Router();

router.route("/").get(validateToken, getUser).patch(validateToken, updateUser);
// .delete();

// router.patch("/", validateToken, updateUser);
export default router;
