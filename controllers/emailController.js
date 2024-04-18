const nodemailer = require("nodemailer");
const { FormData } = require("../model/formData");

// Function to send emails using Nodemailer
async function sendEmail(emailOptions) {
  // Configure the SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });



  // Send the email
  await transporter.sendMail(emailOptions);
}

// Handle form submission
module.exports.handleForm = async (req, res) => {
  const {
    name,
    nationality,
    country,
    email,
    phoneNumber,
    surname,
    location,
    documentOne,
    documentTwo,
    documentThree,
    documentFour,
    documentFive,
    documentSix,
    otherDocument,
    license,
    note,
    agentCode,
    agentName,
    agentEmail,
    agentNumber,
    course,
    skillsSpecialization,
    summary,
    level,
    studyDestination,
    countryToStudy,
    schools,
    companyWebsite,
    educationHistory,
    employmentHistory,
    countryCode,
    role,
    destinationCountry,
    purposeOfTravel,
    companyName,
  } = req.body;

  try {
    // Save form data to MongoDB
    const formData = new FormData({
      name,
      nationality,
      country,
      location,
      companyName,
      companyWebsite,
      email,
      phoneNumber,
      note,
      summary,
      countryCode,
      role,
      agentCode,
      agentName,
      agentEmail,
      agentNumber,
      license,
      otherDocument,
      documentOne,
      documentTwo,
      documentThree,
      documentFour,
      documentFive,
      documentSix,
      course,
      skillsSpecialization,
      surname,
      schools,
      level,
      studyDestination,
      countryToStudy,
      educationHistory,
      employmentHistory,
      destinationCountry,
      purposeOfTravel,
    });
    await formData.save();

    // Send email to the customer
    const customerEmail = {
      from: "info@gotajiri.com",
      // from: "support@digitaladplanet.com",
      to: email,
      subject: "Thank you for your submission and we hope to see you soon.",
      text: "Your application has been received. We will get back to you soon.",
    };

    console.log(customerEmail);
    await sendEmail(customerEmail);

    // Send email to the business owner
    const ownerEmail = {
      from: "info@gotajiri.com",
      // to: "aselemidivine@gmail.com",
      to:  "aselemidivine@gmail.com",
      subject: "New Form Submission",
      text: `A new study visa form submission has been received!.\n\nEmail: ${email}\nPhone: ${phoneNumber} \nName: ${name} \nSurname: ${surname} \nNationality: ${nationality} \nStudy-destination: ${studyDestination}  \nSchool: ${schools}  \nCourse: ${course} \nEducation-Level: ${level} \nAgent-Code: ${agentCode} \nAgent-Name: ${agentName} \nAgent-Email: ${agentEmail} \nAgent-Number: ${agentNumber}  \nsummary: ${summary} `,
      // attachments: [],
    };

    await sendEmail(ownerEmail);

    res.send("Form submitted successfully");
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).send("An error occurred while submitting the form");
  }
};
