const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

const {
  getSummary,
  getCategorySummary,
  getMonthlyTrends
} = require("../controllers/analyticsController");

router.get(
  "/summary",
  auth,
  authorize(["admin", "analyst", "viewer"]),
  getSummary
);

router.get(
  "/category",
  auth,
  authorize(["admin", "analyst"]),
  getCategorySummary
);

router.get(
  "/trends",
  auth,
  authorize(["admin", "analyst"]),
  getMonthlyTrends
);

module.exports = router;