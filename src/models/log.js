const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  action: {
    type: String,
    enum: ["create", "update", "delete"],
    required: true
  },

  entityType: {
    type: String,
    enum: ["record", "user"],
    required: true
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  metadata: {
    type: Object
  }

}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);