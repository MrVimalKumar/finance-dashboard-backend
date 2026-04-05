const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiException = require("../utils/ApiException");

exports.register = async (data) => {
  const { name, email, password, role } = data;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiException("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
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

  const token = jwt.sign(
    { userId: user._id, role: user.role },
     process.env.JWT_SECRET ,
    //  || "vimal..2103",
    { expiresIn: "1d" }
  );

  return { user, token };
};