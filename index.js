const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const PORT = 5000 || process.env.PORT;
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const ApiLogs = require("./models/ApiLogs");
const logger = require("./middleware/logger");
const asyncHandler = require("./middleware/async");
const cron = require("./cron/add_azure_users");
const roleCron = require("./cron/add_roles");
connectDB();

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);
app.use(cors());
app.get("/healthcheck", (req, res) => {
  return res.json({ message: "Server is running" });
});
app.use("/api/users", require("./routes/users"));
app.use("/api/docs", require("./routes/docs"));
app.use("/api/logo", require("./routes/logo"));
app.use("/api/microsoft_ad", require("./routes/microsoft_ad"));
app.use("/api/mad", require("./routes/mad"));
app.use("/api/logs", require("./routes/ApiLogs"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/template", require("./routes/template"));
app.use("/api", require("./routes/documentRoutes"));
app.use(errorHandler);
app.use("/uploads", express.static("uploads")); // Serve uploaded files as static

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}...`
  );
});
