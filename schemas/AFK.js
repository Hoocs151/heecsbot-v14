const mongoose = require('mongoose');

const AFKSchema = mongoose.model("AFKSchema",
    new mongoose.Schema(
        {
            guild: {
                type: String,
                required: true
            },
            user: {
                type: String,
                required: true
            },
            reason: {
                type: String,
                required: false
            }
        }
    )
);

module.exports = { AFKSchema };