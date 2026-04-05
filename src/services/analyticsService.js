const Record = require("../models/record");

const buildMatch = (user) => {
  const match = { isDeleted: false };

  if (user.role !== "admin" && user.role !== "analyst") {
    match.userId = user.userId;
  }

  return match;
};

exports.getSummary = async (user) => {
  const match = buildMatch(user);

  const result = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const data = result[0] || {
    totalIncome: 0,
    totalExpense: 0,
    count: 0,
  };

  return {
    ...data,
    netBalance: data.totalIncome - data.totalExpense,
  };
};

exports.getCategorySummary = async (user) => {
  const match = buildMatch(user);

  return await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          category: "$category",
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);
};

exports.getMonthlyTrends = async (user) => {
  const match = buildMatch(user);

  return await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $addFields: {
        net: { $subtract: ["$income", "$expense"] },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);
};