const { ctrlWrapper } = require("../../helpers/index.js");
const { Dashboard } = require("../../models/admin/dashboard.js");
const { Product } = require("../../models/product.js");
const User = require("../../models/user.model").default;


const getDashboardInfo = async (req, res) => {
    const dashboard = await Dashboard.find();
    const productsCount = await Product.countDocuments();
    const customersCount = await User.countDocuments({ role: "user" }); // only role: 'user'
    const customers = await User.find({ role: "user" }).sort({createdAt: -1}).limit(5).select("-token -password -__v");
    res.json({ dashboard, productsCount, customersCount, customers});
};

module.exports = {
    getDashboardInfo: ctrlWrapper(getDashboardInfo),
};
