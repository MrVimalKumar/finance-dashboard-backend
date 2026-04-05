const authService = require("../services/authService");
const wrapAsync = require("../utils/wrapAsync");
const ApiException = require("../utils/ApiException");

exports.register = wrapAsync(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiException("Required fields missing", 400);
  }

  const user = await authService.register(req.body);

  user.password = undefined;

  res.status(201).json({
    success: true,
    data: user,
  });
});

exports.login = wrapAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiException("Required fields missing", 400);
  }

  const { user, token } = await authService.login(email, password);

  user.password = undefined;

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  res.json({
    success: true,
    data: user,
  });
});

exports.logout = (req, res) => {
  res.clearCookie("token");

  res.json({
    success: true,
    message: "Logged out",
  });
};