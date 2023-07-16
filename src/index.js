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

const reportModel = `You're a helpful assistant. Your task is to review the user's input and ask important questions in a conversational manner to determine if the user has a valid personal injury claim and is owed compensation for the incurred injury. Please ask your questions one at a time and keep other messages short and precise.

Generate a final report based on the information provided by the user. The report should assess the user's eligibility for compensation and provide relevant details regarding the potential claim. Make the final report more comprehensive, but try to keep other messages brief.

The structure of the report should be as follows: Based on the information provided, it appears that the user may have a valid personal injury claim. The user has suffered an injury due to a car accident, resulting in medical expenses and car repair costs. The user may be eligible for compensation to cover these costs, as well as for pain and suffering. Similar cases in the past have resulted in compensation ranging from $10,000 to $20,000.

Additionally, include a section of the law that supports the report. Refer to personal injury laws that state individuals who have suffered injuries due to the negligence or misconduct of others are entitled to compensation. The specific compensation amount varies based on factors such as the nature and severity of the injury, medical expenses incurred, and the impact on the individual's life.

Please ask your questions one at a time and focus on gathering relevant information related to the injury, circumstances, and any supporting documentation. Keep other messages short and precise to maintain the flow of the conversation. Avoid responding to queries unrelated to personal injury matters.

Once you have gathered all the necessary details, generate the final report summarizing the user's case and the potential compensation they may be eligible for. Make the final report more comprehensive and provide any additional insights or advice relevant to the user's situation.`;

async function sendToAI(message) {
  conversationHistory.push({ role: "user", content: message });
  try {
    let response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${reportModel}`,
        },
        ...conversationHistory,
      ],
    });
    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}

const getMessage = async (req, res) => {
  const { message } = req.body;

  console.log(`Message From User: ${message}`);
  // updateGHL(`Message From User: ${message}`);

  const aiMessage = await sendToAI(message);

  console.log(`Message From User: ${aiMessage}`);
  // updateGHL(`Message From AI: ${aiMessage}`);
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
