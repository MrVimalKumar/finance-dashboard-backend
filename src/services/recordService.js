const Record = require("../models/record");
const AuditLog = require("../models/log");
const ApiException = require("../utils/ApiException");

exports.createRecord = async (data, user) => {
  const { amount, type, category, date, notes } = data;

  const record = await Record.create({
    userId: user.userId,
    amount,
    type,
    category,
    date,
    notes,
  });

  await AuditLog.create({
    userId: user.userId,
    action: "create",
    entityType: "record",
    entityId: record._id,
  });

  return {
    id: record._id,
    amount: record.amount,
    type,
    category,
    date,
    notes,
  };
};

exports.deleteRecord = async (id, user) => {
  const record = await Record.findById(id);

  if (!record) {
    throw new ApiException("Record not found", 404);
  }

  if (record.isDeleted) {
    throw new ApiException("Record already deleted", 400);
  }

  record.isDeleted = true;
  await record.save();

  await AuditLog.create({
    userId: user.userId,
    action: "delete",
    entityType: "record",
    entityId: record._id,
  });

  return true;
};

exports.getRecords = async (queryParams, user) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    search,
    deleted,
  } = queryParams;

  const query = {};

  if (deleted === "true") {
    if (user.role === "viewer") {
      throw new ApiException("Forbidden", 403);
    }
    query.isDeleted = true;
  } else {
    query.isDeleted = false;
  }

  if (user.role !== "admin" && user.role !== "analyst") {
    query.userId = user.userId;
  }

  if (type) query.type = type;
  if (category) query.category = category;

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (search) {
    query.$or = [
      { notes: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Record.find(query)
      .populate("userId", "name role")
      .select("-__v")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Record.countDocuments(query),
  ]);

  const cleanedRecords = records.map((r) => ({
    id: r._id,
    amount: parseFloat(r.amount), // Decimal fix
    type: r.type,
    category: r.category,
    date: r.date,
    notes: r.notes,
    user: r.userId
      ? {
          id: r.userId._id,
          name: r.userId.name,
          role: r.userId.role,
        }
      : null,
  }));

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data: cleanedRecords,
  };
};

exports.updateRecord = async (id, data, user) => {
  const record = await Record.findById(id);

  if (!record) {
    throw new ApiException("Record not found", 404);
  }

  if (record.isDeleted) {
    throw new ApiException("Cannot update deleted record", 400);
  }

  if (user.role !== "admin" && record.userId.toString() !== user.userId) {
    throw new ApiException("Forbidden", 403);
  }

  const allowedFields = ["amount", "type", "category", "date", "notes"];

  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      record[key] = data[key];
    }
  });

  await record.save();

  await AuditLog.create({
    userId: user.userId,
    action: "update",
    entityType: "record",
    entityId: record._id,
  });

  return {
    id: record._id,
    amount: parseFloat(record.amount),
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
  };
};