// @ts-nocheck
const express = require("express");
const { authenticate } = require("../../middlewares/admin/index.js");
const { getAllCustomers, getCustomer } = require("../../controllers/admin/customers.js");

const router = express.Router();

router.get("/", authenticate, getAllCustomers);

router.get("/:_id", authenticate, getCustomer);

module.exports = router;
