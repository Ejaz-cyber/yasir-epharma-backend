// @ts-nocheck
require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

const DB_HOST = process.env.DB_HOST;
const PORT = process.env.PORT || 3001;

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
