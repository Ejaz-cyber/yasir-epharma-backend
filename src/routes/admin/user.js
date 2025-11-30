// @ts-nocheck
const express = require("express");
const { validateBody, authenticate } = require("../../middlewares/admin/index.js");
const { schemas } = require("../../models/admin/user.js");
const { login, register, getUserInfo, logout, getAllUsers } = require("../../controllers/admin/auth.js");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), register);

router.post("/login", validateBody(schemas.loginSchema), login);

router.get("/user-info", authenticate, getUserInfo);

router.get("/logout", authenticate, logout);

router.get("/get-all-users", authenticate, getAllUsers);

module.exports = router;
