const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    // Add other fields as necessary
});

// module.exports = mongoose.model('Template', templateSchema);
module.exports = Template = mongoose.model('Template', templateSchema)