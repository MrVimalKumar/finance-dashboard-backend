const analyticsService = require("../services/analyticsService");
const wrapAsync = require("../utils/wrapAsync");

exports.getSummary = wrapAsync(async (req, res) => {
  const data = await analyticsService.getSummary(req.user);

  res.json({
    success: true,
    data,
  });
});

exports.getCategorySummary = wrapAsync(async (req, res) => {
  const data = await analyticsService.getCategorySummary(req.user);

  res.json({
    success: true,
    data,
  });
});

exports.getMonthlyTrends = wrapAsync(async (req, res) => {
  const data = await analyticsService.getMonthlyTrends(req.user);

  res.json({
    success: true,
    data,
  });
});