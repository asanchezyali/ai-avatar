import { OpenAI } from "langchain/llms/openai";
import { GooglePaLM } from "langchain/llms/googlepalm";
import { PromptTemplate } from "langchain/prompts";
import { NextApiRequest, NextApiResponse } from 'next';
import personalityConfig from "@/context/personality";

const openAI = new OpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  temperature: 0.2,
});

const PaLM = new GooglePaLM({
  apiKey: process.env.NEXT_PUBLIC_PALM_API_KEY,
  temperature: 0.5,
});

const prompt = PromptTemplate.fromTemplate(
  `Your task is to acting as a character that has this personality: "${personalityConfig.personality}". 
  Your response must be based on your personality. You have this backstory: "${personalityConfig.backStory}". 
  Your knowledge base is: "${personalityConfig.knowledgeBase}". The response should be one single sentence only. 
  Please answer within 100 characters the following message: {message}. 
  The response must be based on the personality, backstory, and knowledge base that you have. 
  The answer must be concise and short and must be one single sentence only without quotes or any other symbols.`
);

const sendMessageToOpenAI = async (message: string): Promise<string> => {
  const promptWithMessage = await prompt.format({ message });
  const response = await openAI.predict(promptWithMessage);
  return response;
};

const sendMessageToPALM = async (message: string): Promise<string> => {
  const promptWithMessage = await prompt.format({ message });
  const response = await PaLM.predict(promptWithMessage);
  return response;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const message = req.body.message;
    try {
      const response = await sendMessageToOpenAI(message);
      res.status(200).json({ response });
    } catch (error) {
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
