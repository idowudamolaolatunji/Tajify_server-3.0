const mongoose = require('mongoose');


const newsLetterSchema = new mongoose.Schema({
    email: {
        type: String,
		unique: true,
		trim: true,
		lowercase: true,
    },
}, {
    timestamps: true
});


const NewsLetter = mongoose.model('NewsLetter', newsLetterSchema);
module.exports = NewsLetter;