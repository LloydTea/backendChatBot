const { config } = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");

config();

// Create an instance of Express application
const app = express();

const allowedOrigins = [
  "https://frontendchatbot.netlify.app",
  "https://ai.615nashlaw.com",
];

// Enable CORS middleware
app.use(cors(allowedOrigins));
// app.options("*", cors());

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routers
const router = require("./routes/messageRouter");

app.use("/", router.router);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
