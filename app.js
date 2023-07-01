const { config } = require("dotenv");
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");

config();
const allowedOrigins = [
  "https://frontendchatbot.netlify.app",
  "https://ai.615nashlaw.com",
];

// Create an instance of Express application
const app = express();

// Enable CORS middleware
app.use(cors({ origin: allowedOrigins }));

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routers
const router = require("./routes/messageRouter");

app.use("/", router.router);

// Define the handler function for AWS Lambda
exports.handler = serverless(app);
