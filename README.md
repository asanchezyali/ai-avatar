https://github.com/asanchezyali/zippy-ai-bot/assets/29262782/933ce0c3-434b-45f8-8c27-6a8669da0407
## Zippy Talking Avatar with Azure Cognitive and Langchain

Zippy Talking Avatar uses Azure Cognitive Services and OpenAI GPT-3 to generate text and speech. It is built with Next.js and Tailwind CSS. This  avatar responds to user input by generating both text and speech, offering a dynamic and immersive user experience. 

## How it works
Zippy seamlessly blends the power of multiple AI technologies to create a natural and engaging conversational experience:

1. Text Input: Start the conversation by typing your message in the provided text box.
2. GPT-3 Response Generation: Your text is forwarded to OpenAI's GPT-3, which crafts a coherent and meaningful response.
3. Azure Cognitive Services: Speech Synthesis: Azure's text-to-speech capabilities transform GPT-3's response into natural-sounding audio.
4. Viseme Generation: Azure creates accurate visemes (visual representations of speech sounds) to match the audio.
5. Synchronized Delivery: The generated audio and visemes are delivered to Zippy, bringing the avatar to life with synchronized lip movements and spoken words.
<br>
<div align="center">
  <img src="public/images/architecture.svg" alt="Logo" width="100%">
</div>

## Getting Started

### Prerequisites
1. Azure subscription - [Create a free account](https://azure.microsoft.com/free/cognitive-services).
2. [Create a Speech resource](https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices) in the Azure portal.
3. Your Speech resource key and region. After your Speech resource is deployed, select Go to resource to view and manage keys. For more information about Azure AI services resources, see [Get the keys for your resource](https://learn.microsoft.com/en-us/azure/ai-services/multi-service-resource?pivots=azportal#get-the-keys-for-your-resource).
4. OpenAI subscription - [Create one](https://openai.com/product).
5. [Creare a new secret key](https://platform.openai.com/api-keys) in the OpenAI portal.
6. Node.js and npm (or yarn)

### Installation

1. Clone this repository
  
```bash
git clone https://github.coma/asanchezyali/zippy-talking-avatar.git
```

2. Navigate to the project directory

```bash
cd zippy-talking-avatar
```

3. Install dependencies
```bash
npm install
# or
yarn install
```
4. Create a .env.development file in the root directory of the project and add the following environment variables:

```bash
# AZURE
NEXT_PUBLIC_SPEECH_KEY=<YOUR_AZURE_SPEECH_KEY>
NEXT_PUBLIC_SPEECH_REGION=<YOUR_AZURE_SPEECH_REGION>

# OPENAI
NEXT_PUBLIC_OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Additional information

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
