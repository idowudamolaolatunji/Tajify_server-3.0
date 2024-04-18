const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');
dotenv.config({ path: './config.env' })


const DB = process.env.TAJIFY_DATABASE.replace('<PASSWORD>', process.env.TAJIFY_DATABASE_PASSWORD);
const PORT = process.env.PORT || 8080;

// Database connection
mongoose.connect(DB)
    .then(() => {
        console.log('Database connected successfully!');
    })
    .catch((err) => {
        console.log(err)
    })
;

const cron = require('node-cron');
const revenueDistributions = require("./utils/revenueDistributions");

cron.schedule('0 13 * * 1', () => {
    console.log('I was scheduled!');
});


// Listening to the server
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});
