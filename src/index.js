const { config } = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");
config();

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.API_KEY,
  })
);

let conversationHistory = [];
const reportModel = `Based on the input given by user generate a report if user is owed compensation for personal injury incured. Model the structure of this report:- Based on the information you have provided, it appears that you may have a valid personal injury claim. You have suffered a car crash, which led to medical expenses and car repair costs. You may be eligible for compensation for these costs, as well as for pain and suffering. Past cases with similar injuries have resulted in compensation ranging from $10,000 to $20,000.

Given the information you have provided, I recommend that you book a call with a personal injury lawyer to discuss your case. A lawyer can provide you with a more accurate estimate of the compensation you may be eligible for, as well as advice on how to make your case stronger. They can also advise you on the best way to proceed with your claim.`;

async function sendToAI(message) {
  conversationHistory.push({ role: "user", content: message });
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You're a helpful assistant, You are to review users input, ask important questions that will help you determine if the user has a valid personal injury and is owed a compensation for injury incured. And finaly generate a report similar to ${reportModel}. Also add casually section of the law that supports the report you're generating. Do not respond to anything not regarding to personal injury`,
        },
        ...conversationHistory,
      ],
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    return error.message;
  }
}

const getMessage = async (req, res) => {
  const { message } = req.body;
  try {
    const response = await sendToAI(message);
    res.status(200).send({
      message: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateReport = async (req, res) => {
  conversationHistory = [];
  const { name, email, injurytype, injuryprocess, postinjury } = req.body;
  const userMessage = `I am ${name}. My email is ${email}. I experienced a(n) ${injurytype}, ${injuryprocess}, ${postinjury}`;
  try {
    const response = await sendToAI(userMessage);
    res.status(200).send({
      message: response,
    });
  } catch (error) {
    console.error(error.message);
  }
};

// generateReport(userAnswers);
module.exports = { getMessage, generateReport };
