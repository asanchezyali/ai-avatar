import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { BaseOutputParser, FormatInstructionsOptions } from "langchain/schema/output_parser";
import personalityConfig from "@/constants/personality";
import { RunnableLambda, RunnableMap, RunnablePassthrough } from "langchain/runnables";


const template = `Your task is to acting as a character that has this personality: ${personalityConfig.personality} 
  and this backstory: ${personalityConfig.backStory} and you always reply with a maximum of 100 words. You should be able to answer questions about this 
  ${personalityConfig.knowledgeBase}, always responding with a maximum of 100 words.`;

const prompt = ChatPromptTemplate.fromMessages([
  ["ai", template],
  ["human", "{question}"],
]);

const model = new ChatOpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  temperature: 0.2,
});

const url = "https://monadical.com/";

const compiledConvert = compile({ wordwrap: 130 });

const loader = new RecursiveUrlLoader(url, {
  extractor: compiledConvert,
  maxDepth: 2,
});

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 20,
});

const splittedDocs = await splitter.splitDocuments(docs);

const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
const vectorStore = await HNSWLib.fromDocuments(splittedDocs, embeddings);
const retriever = vectorStore.asRetriever(1);

const setupAndRetrieval = RunnableMap.from({
  context: new RunnableLambda({
    func: (input: string) => retriever.invoke(input).then((response) => response[0].pageContent),
  }).withConfig({ runName: "contextRetriever" }),
  question: new RunnablePassthrough(),
});


class OpenAIOutputParser extends BaseOutputParser<string> {
  getFormatInstructions(options?: FormatInstructionsOptions | undefined): string {
    throw new Error("Method not implemented.");
  }
  lc_namespace!: string[];
  async parse(text: string): Promise<string> {
    return text.replace(/"/g, "");
  }
}

const outputParser = new OpenAIOutputParser();

const openAIchain = setupAndRetrieval.pipe(prompt).pipe(model).pipe(outputParser);

export default openAIchain;