const mongoose = require('mongoose');

const RolesSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    }
}, { timestamps: true })



module.exports = Roles = mongoose.model("Roles", RolesSchema);