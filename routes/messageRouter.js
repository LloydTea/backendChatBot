const generateResponse = require("../index.js");

const router = require("express").Router();

router.post("/send", generateResponse.getMessage);
router.post("/report", generateResponse.generateReport);
router.get("/", (req, res) => {
  res.json({
    hello: "hi!",
  });
});

router.get("/test", (req, res) => {
    res.json({
      hello: "test!",
    });
  });

module.exports = { router };
