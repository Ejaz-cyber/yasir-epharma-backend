// @ts-nocheck
const express = require("express");
const { authenticate } = require("../../middlewares/admin");
const { getDashboardInfo } = require("../../controllers/admin/dashboard");

const router = express.Router();

router.get("/", authenticate, getDashboardInfo);

module.exports = router;