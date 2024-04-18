const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');
dotenv.config({ path: './config.env' });

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

// Listening to the server
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});