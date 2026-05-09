// @ts-nocheck
require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/user.model").default;
const Otp = require("./models/mobile/Otp").default;

const DB_HOST = process.env.DB_HOST;
const PORT = process.env.PORT || 3001;

mongoose
  .connect(DB_HOST)
  .then(async () => {
    console.log("Database connection successful");

    // Sync indexes: drops stale indexes (e.g. old non-sparse email_1)
    // and recreates them as defined in the schema (sparse + partialFilter)
    await User.syncIndexes();
    await Otp.syncIndexes();
    console.log("Indexes synced");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
