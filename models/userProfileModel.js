const mongoose = require('mongoose');



const userProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    telephone: {
		type: Number,
		default: "",
	},
	portfolioLink: {
		type: String,
		default: "",
	},
	location: {
		type: String,
		default: "",
	},
	occupation: {
		type: String,
		default: "",
	},
	education: {
		type: String,
		default: "",
	},
	specialization: {
		type: mongoose.SchemaTypes.Array,
		default: [],
	},
	interest: {
		type: mongoose.SchemaTypes.Array,
		default: [],
	},
	jobTitle: {
		type: String,
		default: "",
	},
	businessName: {
		type: String,
		default: "",
	},
	website: {
		type: String,
		default: "",
	},
	bio: {
		type: String,
		trim: true,
		default: "",
	},
	
})