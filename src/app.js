const { config } = require("dotenv");
const app = require("express")();
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");

config();
const allowedOrigins = [
  "https://frontendchatbot.netlify.app",
  "http://ai.615nashlaw.com",
];
// Enable CORS middleware
app.use(cors({ origin: allowedOrigins }));

// app.use(cors(corsOptions));

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routers
const router = require("../routes/messageRouter");

app.use("/", router.router);

// app.listen(PORT, () => console.log(`It's Alive on http://localhost:${PORT}`));

module.exports.handler = serverless(app);
