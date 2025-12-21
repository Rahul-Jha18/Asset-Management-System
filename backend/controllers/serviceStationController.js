const asyncHandler = require("express-async-handler");
const ServiceStation = require("../models/ServiceStation");
const { sendSuccess } = require("../utils/response");

exports.getServiceStations = asyncHandler(async (req, res) => {
  const rows = await ServiceStation.findAll({
    order: [["id", "ASC"]],
  });
  return sendSuccess(res, rows, "Service stations fetched successfully");
});
