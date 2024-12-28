const mongoose = require('mongoose');

const docSchema = mongoose.Schema({
    name: {
        type: String,
        // minlength: [4, 'Name cant be less than 4 char'],
    },

    description: {
        type: String,
    },

    file_path: {
        type: String,
        required: true
    }


}, { timestamps: true })



module.exports = Doc = mongoose.model('Doc', docSchema)
