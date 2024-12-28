const mongoose = require("mongoose");

const MSADSettingsSchema = mongoose.Schema(
  {
    smtp_server: {
      type: String,
      required: false,
    },
    port_number_default_25: {
      type: String,
      required: false,
    },
    from_address: {
      type: String,
      required: false,
    },
    use_secure_transport: {
      type: String,
      required: false,
    },
    use_authentication: {
      type: String,
      required: false,
    },
    authentication_user_id: {
      type: String,
      required: false,
    },
    authentication_password: {
      type: String,
      required: false,
    },
    azure_tenant: {
      type: String,
      required: false,
    },
    app_id: {
      type: String,
      required: false,
    },
    app_secret: {
      type: String,
      required: false,
    },
    client_id: {
      type: String,
      required: false,
    },
    start_hour_24h: {
      type: String,
      required: false,
    },
    start_minute: {
      type: String,
      required: false,
    },
    last_synchronization: {
      type: String,
      required: false,
    },
    isActivate: {
      type: Boolean,
      required: false,
    },
    isIncludeDomain: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = microsoft_ad = mongoose.model(
  "microsoft_ad",
  MSADSettingsSchema
);
