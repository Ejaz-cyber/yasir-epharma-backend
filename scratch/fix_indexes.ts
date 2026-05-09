import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function fixIndexes() {
  try {
    const mongoUri = process.env.DB_HOST;
    if (!mongoUri) {
      console.error("DB_HOST not found in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const collection = mongoose.connection.collection("users");

    console.log("Checking indexes...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    // Drop email_1 if it exists
    if (indexes.find(i => i.name === "email_1")) {
      console.log("Dropping index email_1...");
      await collection.dropIndex("email_1");
      console.log("Dropped email_1");
    }

    // Drop phone_1 if it exists
    if (indexes.find(i => i.name === "phone_1")) {
      console.log("Dropping index phone_1...");
      await collection.dropIndex("phone_1");
      console.log("Dropped phone_1");
    }

    console.log("Indexes dropped successfully. They will be recreated with the correct 'sparse' and 'partialFilterExpression' settings when you restart the server.");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing indexes:", error);
    process.exit(1);
  }
}

fixIndexes();
