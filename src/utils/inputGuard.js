const ApiException = require("./ApiException");

exports.ensureRecordPayload = (payload) => {
  const { amount, type, category, date } = payload;

  if (!amount || !type || !category || !date) {
    throw new ApiException("Missing required record fields", 400);
  }

  if (!["income", "expense"].includes(type)) {
    throw new ApiException("Unsupported record type", 400);
  }
};