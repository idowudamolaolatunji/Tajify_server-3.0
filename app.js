const path = require('path')
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');

////////////////////////////////////////////////
const userRouter = require("./routes/userRoute.js");
const blogRouter = require("./routes/blogRoute.js");
const walletRouter = require("./routes/walletRoute.js");
const kycRouter = require("./routes/kycRoute.js");
const transactionRouter = require('./routes/transactionRoute.js');
const stakeRouter = require("./routes/stakeRoute.js");
const communityFeedRouter = require("./routes/communityFeedRoute.js");
const searchRouter = require("./routes/searchRoute.js");
const courseRouter = require('./routes/courseRoute.js');
const marketProductRouter = require('./routes/marketProductRoute.js');

//////////////////////////////////////////
const app = express();

//// Middelwares ////
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// const corsOptions = {
//   origin: [
//     "https://tajify.com",
//     "http://localhost:5173",
//     "http://localhost:5174",
//     "http://localhost:5175",
//   ],
//   methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));

// app.use(cors());

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log("Fecthing data...");
  next();
});

//// Routes Endpoints ////
// Mounting our Endpoints (Middleware)
app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/wallets", walletRouter);
app.use("/api/stakings", stakeRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/kyc", kycRouter);
app.use("/api/community-feeds", communityFeedRouter);
app.use("/api/search", searchRouter);
app.use("/api/courses", courseRouter);
app.use("/api/market", marketProductRouter);

module.exports = app;
