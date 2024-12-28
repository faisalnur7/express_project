// models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  method: { type: String, required: true },
  url: { type: String, required: true },
  statusCode: { type: Number, required: true },
  requestBody: { type: Object, default: {} },
  responseBody: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ApiLogs', logSchema);
