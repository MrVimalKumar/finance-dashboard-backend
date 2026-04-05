const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

const {
  getUsers,
  updateUserRole,
  updateUserStatus
} = require("../controllers/userController");

router.get(
  "/",
  auth,
  authorize(["admin"]),
  getUsers
);

router.put(
  "/:id/role",
  auth,
  authorize(["admin"]),
  updateUserRole
);

router.put(
  "/:id/status",
  auth,
  authorize(["admin"]),
  updateUserStatus
);

module.exports = router;