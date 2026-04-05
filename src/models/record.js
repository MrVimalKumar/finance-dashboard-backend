const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  date: {
    type: Date,
    required: true
  },

  notes: {
    type: String,
    trim: true
  },
  isDeleted: {
  type: Boolean,
  default: false
}

}, { timestamps: true });


recordSchema.index({ userId: 1 });
recordSchema.index({ type: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ userId: 1, type: 1, date: -1 });


module.exports = mongoose.model("Record", recordSchema);