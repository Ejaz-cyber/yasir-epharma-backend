const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../../helpers");
const { ObjectId } = require( "mongodb" );

const dashboardSchema = new Schema({
    _id: {
        type: ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Income", "Expense", "Error"],
        required: true,
    }
});

dashboardSchema.post("save", handleMongooseError);

const Dashboard = model("dashboard", dashboardSchema);

module.exports = { Dashboard };