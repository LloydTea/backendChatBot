const generateResponse = require("../src/index.js");

const router = require("express").Router();

router.post("/send", generateResponse.getMessage);
router.post("/report", generateResponse.generateReport);

router.get("/test", (req, res) => {
  res.json({
    hello: "Hello World!",
  });
});

module.exports = { router };
