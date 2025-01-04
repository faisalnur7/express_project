const mongoose = require("mongoose");

const RoleSchema = mongoose.Schema(
  {
    uuid:{
      type: String
    },
    name: {
      type: String,
      minlength: [4, "Name cant be less than 5 char"],
    },
    description: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isAzureRole: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = roles = mongoose.model(
  "roles",
  RoleSchema
);
