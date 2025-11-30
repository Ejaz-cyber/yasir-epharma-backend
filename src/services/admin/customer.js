const { default: User } = require("../../models/user.model");

async function getAllCustomers(query) {
  if (query) {
    return User.find({ name: { $regex: query, $options: "i" } });
  }
  return User.find();
}

async function getCustomerById(id) {
  return User.findById(id);
}

module.exports = {
  getAllCustomers,
  getCustomerById,
};
