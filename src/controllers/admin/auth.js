// @ts-nocheck
const { registerAdmin, loginAdmin } = require("../../services/admin/auth");
const { ctrlWrapper } = require("../../helpers");
// const { User } = require("../../models/admin/user");
const User = require("../../models/user.model").default;

const register = ctrlWrapper(async (req, res) => {
  console.log("register", req.body)
  const { email, password, name } = req.body;
  const user = await registerAdmin(email, password, name);
  res.status(201).json({ name: user.name, email: user.email });
});

const login = ctrlWrapper(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await loginAdmin(email, password);
  res.json({ token, name: user.name, email: user.email, _id: user._id });
});

const getUserInfo = ctrlWrapper(async (req, res) => {
  console.log("get user", req.user)
  const { email, name, _id } = req.user;
  res.json({ _id, email, name });
});

const logout = ctrlWrapper(async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({ message: "Logout success" });
});

const getAllUsers = ctrlWrapper(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = {
  register,
  login,
  getUserInfo,
  logout,
  getAllUsers,
};
