const { ctrlWrapper } = require("../../helpers");
const CustomerService = require("../../services/admin/customer");

const getAllCustomers = async (req, res) => {
  const { query } = req.query;
  const customers = await CustomerService.getAllCustomers(query);
  res.json(customers);
};

const getCustomer = async (req, res) => {
  const { _id } = req.params;
  const customer = await CustomerService.getCustomerById(_id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
};

module.exports = {
  getAllCustomers: ctrlWrapper(getAllCustomers),
  getCustomer: ctrlWrapper(getCustomer),
};
