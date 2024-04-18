const { Schema, model } = require('mongoose');

const applicationSchema = Schema({
  name: {
    type: String,
    // required: true,
  },
  // name: [String],
  nationality: {
    type: String,
    // required: true,
  },
  location: String,
  countryCode: {
    type: String,
  },
  agentCode: String,
  agentName: String,
  agentEmail: String,
  agentNumber: String,
  country: {
    type: String,
    // required: true,
  },
  year: String,
  email: {
    type: String,
    // required: true,
  },
  summary: {
    type: String,
    // required: true,
  },
  phoneNumber: {
    type: String,
    // required: true,
  },
  schools: String,
  note: String,
  course: {
    type: String,
    // required: true,
  },
  skillsSpecialization: String,
  studyDestination: {
    type: String,
    // required: true,
  },
  surname: String,
  countryToStudy: {
    type: String,
    // required: true,
  },
  level: String,
  educationHistory: String,
  employmentHistory: String,
  documentThree: String,
  documentFour: String,
  documentFive: String,
  documentSix: String,
  destinationCountry: {
    type: String,
    // required: true,
  },
  dob: String,
  purposeOfTravel: {
    type: String,
    // required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports.FormData = model('Application', applicationSchema);
