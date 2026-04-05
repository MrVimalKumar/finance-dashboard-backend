const recordService = require("../services/recordService");
const wrapAsync = require("../utils/wrapAsync");
const { ensureRecordPayload } = require("../utils/inputGuard");
const ApiException = require("../utils/ApiException");

exports.createRecord = wrapAsync(async (req, res) => {
  ensureRecordPayload(req.body);

  const record = await recordService.createRecord(req.body, req.user);

  res.status(201).json({
    success: true,
    data: record,
  });
});

exports.getRecords = wrapAsync(async (req, res) => {
  const records = await recordService.getRecords(req.query, req.user);

  res.status(200).json({
    success: true,
    data: records,
  });
});

exports.updateRecord = wrapAsync(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiException("No data provided", 400);
  }

  const updatedRecord = await recordService.updateRecord(
    req.params.id,
    req.body,
    req.user
  );

  if (!updatedRecord) {
    throw new ApiException("Record not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedRecord,
  });
});

exports.deleteRecord = wrapAsync(async (req, res) => {
  const result = await recordService.deleteRecord(req.params.id, req.user);

  if (!result) {
    throw new ApiException("Record not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Record deleted",
  });
});