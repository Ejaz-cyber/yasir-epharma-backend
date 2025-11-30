// @ts-nocheck
const express = require("express");
const { authenticate, validateBody } = require("../../middlewares/admin");
const { schemas } = require("../../models/admin/supplier");
const { getAllSuppliers, addSupplier, editSupplier } = require("../../controllers/admin/suppliers");

const router = express.Router();

router.get("/", authenticate, getAllSuppliers );

router.post("/", authenticate, validateBody(schemas.addSupplierSchema), addSupplier);

router.put("/:_id", authenticate, validateBody(schemas.editSupplierSchema), editSupplier);

module.exports = router;