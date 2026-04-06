const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiException = require("../utils/ApiException");

exports.register = async (data) => {
  const { name, email, password } = data;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiException("User already exists", 400);
  }

  const adminExists = await User.exists({ role: "admin" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: adminExists ? "viewer" : "admin",
  });

  return user;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiException("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiException("Invalid credentials", 401);
  }

  if (user.status === "inactive") {
    throw new ApiException("Account inactive", 403);
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return { user, token };
};
