import { Router } from "express";
import {
  getUser,
  updateUser,
  addUserAddress,
  removeUserAddress,
  setPrimaryAddress,
} from "../../controllers/mobile/user.controller";
import { validateToken } from "../../middlewares/mobile/auth.middleware";
import { uploadProfileImage } from "../../middlewares/mobile/user.middleware";

const router = Router();

router
  .route("/")
  .get(validateToken, getUser)
  .patch(validateToken, uploadProfileImage.single("image"), updateUser);

router.post("/address", validateToken, addUserAddress);
router.delete("/address/:addressId", validateToken, removeUserAddress);
router.patch("/address/default/:addressId", validateToken, setPrimaryAddress);
// .delete();

// router.patch("/", validateToken, updateUser);
export default router;
