import personalityConfig from "@/context/personality";

export const BASE_URL = "https://generativelanguage.googleapis.com";
const PALM_URL = `${BASE_URL}/v1beta1/models/chat-bison-001:generateMessage?key=${process.env.NEXT_PUBLIC_LLM_API_KEY}`;

export interface MessageProps {
  author: string;
  content: string;
}

export interface ExampleProps {
  input: { content: string };
  output: { content: string };
}

export interface PromptProps {
  context?: string;
  examples?: ExampleProps[];
  messages: MessageProps[];
}

export interface SendPromptResponse {
  candidates: MessageProps[];
  messages: MessageProps[];
}

let messages: MessageProps[] = [];

const sendPrompt = async (prompt: PromptProps, temperature: number): Promise<SendPromptResponse> => {
  const payload = {
    prompt: { ...prompt },
    temperature,
    candidate_count: 1,
  };

  const response = await fetch(PALM_URL, {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    method: "POST",
  });

  return response.json() as Promise<SendPromptResponse>;
};

const context = `Your task is to acting as a character that has this personality: "${personalityConfig.personality}". 
    Your response must be based on your personality. You have this backstory: "${personalityConfig.backStory}". 
    Your knowledge base is: "${personalityConfig.knowledgeBase}". The response should be one single sentence only.`;

const sendMessageToPALM = async (message: string): Promise<string> => {
  const content = `Please answer within 100 characters. {${message}}. 
    The response must be based on the personality, backstory, and knowledge base that you have. 
    The answer must be concise and short.`;

    const prompt: PromptProps = {
    context: context,
    messages: messages.concat([{ author: "0", content }]),
  };

  const response = await sendPrompt(prompt, 0.25);
  console.log("Prompt: ", prompt);
  console.log(response);

  if (response.candidates && response.candidates.length > 0) {
    messages = response.messages.concat(response.candidates[0]);
  } else {
    messages = response.messages.concat([{ author: "0", content: "Sorry, I don't understand." }]);
  }

  let result = "";
  if (response.candidates && response.candidates.length > 0) {
    result = response.candidates[0].content;
  } else {
    result = "Sorry, I don't understand.";
  }

  return result;
};

export default sendMessageToPALM;
