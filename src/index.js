const { config } = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
config();

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.API_KEY,
  })
);
let conversationHistory = [];

let chathistory = "";
let senderId = "";

const reportModel = `Based on the input given by user generate a report if user is owed compensation for personal injury incured. Model the structure of this report:- Based on the information you have provided, it appears that you may have a valid personal injury claim. You have suffered a car crash, which led to medical expenses and car repair costs. You may be eligible for compensation for these costs, as well as for pain and suffering. Past cases with similar injuries have resulted in compensation ranging from $10,000 to $20,000.

Given the information you have provided, I recommend that you book a call with a personal injury lawyer to discuss your case. A lawyer can provide you with a more accurate estimate of the compensation you may be eligible for, as well as advice on how to make your case stronger. They can also advise you on the best way to proceed with your claim.`;

async function sendToAI(message) {
  conversationHistory.push({ role: "user", content: message });
  let retries = 0;
  while (retries < 3) {
    try {
      console.log(`Retrying... (AI) Attempt ${retries}`);
      let response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You're a helpful assistant, You are to review users input, ask important questions in form of conversation that will help you determine if the user has a valid personal injury and is owed a compensation for injury incured. And finaly generate a report similar to ${reportModel}. Also casually add section of the law that supports the report you're generating. Do not respond to anything not regarding to personal injury`,
          },
          ...conversationHistory,
        ],
      });
      console.log(response.data);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.log(error);
      retries++;
      console.log(`Retrying... Attempt ${retries}`);
      return error.message;
    }
  }
  throw new Error("Request failed after multiple retries");
}

const getMessage = async (req, res) => {
  const { message } = req.body;
  console.log(`Message From User: ${message}`);
  updateGHL(`Message From User: ${message}`);
  const aiMessage = await sendToAI(message);
  console.log(`Message From User: ${aiMessage}`);
  updateGHL(`Message From AI: ${aiMessage}`);
  try {
    res.status(200).send({
      message: aiMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const generateReport = async (req, res) => {
  conversationHistory = []; // Declare the conversationHistory variable using "let" instead of "const"
  const { name, email, phone, injurytype, injuryprocess, postinjury } =
    req.body;
  senderId = email;
  const userMessage = `I am ${name}. My email is ${email} and phone is ${phone}. I experienced a(n) ${injurytype}, ${injuryprocess}, ${postinjury}`;

  console.log(userMessage);
  updateGHL(`Message From User: ${userMessage}`);
  const aiMessage = await sendToAI(userMessage);

  const responseMessage = String(aiMessage);
  console.log(`Message From AI: ${responseMessage}`);
  updateGHL(`Message From AI: ${responseMessage}`);
  try {
    console.log(`Sending Response To Frontend...`);
    res.status(200).send({
      message: responseMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateGHL = (message) => {
  chathistory +=
    message +
    `\n ----------------------------------------------------------------------- \n`;
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://rest.gohighlevel.com/v1/contacts/",
    headers: {
      Authorization: `Bearer ${process.env.Authorization}`,
    },
    data: {
      email: sendToAI,
      customField: { mzbzDzrAEkJQRg27y2Vt: chathistory },
    },
  };

  axios(config)
    .then(function (response) {
      res.status(200).send({
        message: responseMessage,
      });
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
};

module.exports = { getMessage, generateReport };
