// @ts-nocheck
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const userRouter = require("./src/routes/admin/user");
const customersRouter = require("./src/routes/admin/customers");
// const suppliersRouter = require("./src/routes/admin/suppliers");
const productsRouter = require("./src/routes/admin/products");
const dashboardRouter = require("./src/routes/admin/dashboard");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { default: User } = require("./src/models/user.model");
const mobileAuthRoutes = require("./src/routes/mobile/auth").default;
const mobileUserRoutes = require("./src/routes/mobile/user").default;
const mobileProductRoutes = require("./src/routes/mobile/products").default;
const mobileOrderRoutes = require("./src/routes/mobile/orders").default;

const ordersRouter = require("./src/routes/admin/orders.route").default;
const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// js code for admin web
app.use("/api/admin/v1/user", userRouter);
// app.use("/api/admin/v1/customers", customersRouter);
// app.use("/api/admin/v1/suppliers", suppliersRouter);
app.use("/api/admin/v1/products", productsRouter);
app.use("/api/admin/v1/dashboard", dashboardRouter);
app.use("/api/admin/v1/orders", ordersRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ts code for mobile
app.use("/api/mobile/v1/auth", mobileAuthRoutes)
app.use("/api/mobile/v1/user", mobileUserRoutes);
app.use("/api/mobile/v1/products", mobileProductRoutes);
app.use('/api/mobile/v1/orders', mobileOrderRoutes);

// await User.syncIndexes();

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
