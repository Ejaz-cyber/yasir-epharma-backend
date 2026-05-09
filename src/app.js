// @ts-nocheck
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const userRouter = require("./routes/admin/user");
const customersRouter = require("./routes/admin/customers");
// const suppliersRouter = require("./src/routes/admin/suppliers");
const productsRouter = require("./routes/admin/products");
const dashboardRouter = require("./routes/admin/dashboard");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const { default: User } = require("./models/user.model");
const mobileAuthRoutes = require("./routes/mobile/auth").default;
const mobileUserRoutes = require("./routes/mobile/user").default;
const mobileProductRoutes = require("./routes/mobile/products").default;
const mobileOrderRoutes = require("./routes/mobile/orders").default;

const ordersRouter = require("./routes/admin/orders.route").default;
const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// ─── Request / Response Logger ───────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log incoming request
  process.stdout.write("\n==========================================\n");
  process.stdout.write(`>> REQUEST: ${req.method} ${req.originalUrl} [${timestamp}]\n`);

  if (req.headers["authorization"]) {
    const token = req.headers["authorization"];
    process.stdout.write(`   Auth: ${token.substring(0, 40)}...\n`);
  }

  if (req.body && Object.keys(req.body).length > 0) {
    const sanitized = { ...req.body };
    // ["password", "confirmPassword", "otp", "token"].forEach((k) => {
    //   if (sanitized[k]) sanitized[k] = "***";
    // });
    process.stdout.write(`   Body: ${JSON.stringify(sanitized, null, 2)}\n`);
  }

  // Intercept res.json to capture and log the response body
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const ms = Date.now() - start;
    process.stdout.write(`<< RESPONSE: ${req.method} ${req.originalUrl}\n`);
    process.stdout.write(`   Status: ${res.statusCode} (${ms}ms)\n`);
    if (body) {
      process.stdout.write(`   Body: ${JSON.stringify(body, null, 2)}\n`);
    }
    process.stdout.write("==========================================\n\n");
    return originalJson(body);
  };

  next();
});
// ─────────────────────────────────────────────────────────────────────────────

// js code for admin web
app.use("/api/admin/v1/user", userRouter);
// app.use("/api/admin/v1/customers", customersRouter);
// app.use("/api/admin/v1/suppliers", suppliersRouter);
app.use("/api/admin/v1/products", productsRouter);
app.use("/api/admin/v1/dashboard", dashboardRouter);
app.use("/api/admin/v1/orders", ordersRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ts code for mobile
app.use("/api/mobile/v1/auth", mobileAuthRoutes);
app.use("/api/mobile/v1/user", mobileUserRoutes);
app.use("/api/mobile/v1/products", mobileProductRoutes);
app.use("/api/mobile/v1/orders", mobileOrderRoutes);

// await User.syncIndexes();

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
