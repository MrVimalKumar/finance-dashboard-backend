const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordControllers");

router.post(
  "/",
  auth,
  authorize(["admin", "analyst"]),
  createRecord
);

router.get(
  "/",
  auth,
  authorize(["admin", "analyst", "viewer"]),
  getRecords
);

router.put(
  "/:id",
  auth,
  authorize(["admin"]),
  updateRecord
);

router.delete(
  "/:id",
  auth,
  authorize(["admin"]),
  deleteRecord
);

module.exports = router;