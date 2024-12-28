const mongoose = require('mongoose');

const LogoSchema = mongoose.Schema({
    file_path: {
        type: String,
        required: true
    }
}, { timestamps: true })



module.exports = Logo = mongoose.model("Logo", LogoSchema);