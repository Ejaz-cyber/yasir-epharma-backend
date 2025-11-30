import { Router } from "express";
import { validateOtp, validatePhone } from '../../middlewares/mobile/auth.middleware';
import {
  getOtp,
  refreshAccessTokenController,
  verifyOtpController,
} from "../../controllers/mobile/auth.controller";

const router = Router();

// another style of writing, it helps to grouping
// router
//   .route("/user")
//   .get(getUser)
//   .put(updateUser)
//   .delete(deleteUser);

// basic style
// router.get("/user", getUser);
// router.put("/user", updateUser);
// router.delete("/user", deleteUser);

router.post("/get-otp", validatePhone, getOtp);
router.post("/verify-otp", validatePhone, validateOtp, verifyOtpController);
router.post("/refreshToken", refreshAccessTokenController);

export default router;
