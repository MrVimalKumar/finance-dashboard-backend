const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const ApiException = require("../utils/ApiException");

exports.getUsers = wrapAsync(async (req, res) => {
  const users = await User.find().select("-password -__v");

  res.json({
    success: true,
    data: users,
  });
});

exports.updateUserRole = wrapAsync(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    throw new ApiException("Required fields missing", 400);
  }

  if (!["viewer", "analyst", "admin"].includes(role)) {
    throw new ApiException("Invalid role", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiException("User not found", 404);
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: user,
  });
});

exports.updateUserStatus = wrapAsync(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ApiException("Required fields missing", 400);
  }

  if (!["active", "inactive"].includes(status)) {
    throw new ApiException("Invalid status", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiException("User not found", 404);
  }

  user.status = status;
  await user.save();

  res.json({
    success: true,
    data: user,
  });
});