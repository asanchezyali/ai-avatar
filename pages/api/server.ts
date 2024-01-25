import { NextApiRequest, NextApiResponse } from "next";
import openAIchain from "./openai";
import textToSpeech from "./azureTTS";

interface SpeechData {
  audioBuffer: Buffer;
  visemes: { offset: number; id: number }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const message = req.body.message;
    try {
      const openAIResponse = await openAIchain.invoke(message);
      const speechData = (await textToSpeech(openAIResponse)) as SpeechData;
      res.status(200).json({
        response: openAIResponse,
        audioBuffer: speechData.audioBuffer,
        visemes: speechData.visemes,
      });
    } catch (error) {
      res.status(500).json({ error: "Error processing request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
