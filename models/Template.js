const mongoose = require('mongoose');

const templateSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: [5, 'Name cant be less than 5 char'],
    },

    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })



module.exports = Template = mongoose.model('templates', templateSchema)
