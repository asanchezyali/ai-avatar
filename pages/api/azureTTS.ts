import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { Buffer } from "buffer";

const AZURE_SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
const AZURE_VOICE_NAME = process.env.NEXT_PUBLIC_AZURE_VOICE_NAME;

if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION || !AZURE_VOICE_NAME) {
  throw new Error("Azure API keys are not defined");
}

function buildSSML(message: string) {
  return `<speak version="1.0"
  xmlns="http://www.w3.org/2001/10/synthesis"
  xmlns:mstts="https://www.w3.org/2001/mstts"
  xml:lang="en-US">
  <voice name="en-US-JennyNeural">
      <mstts:viseme type="redlips_front"/>
      <mstts:express-as style="excited">
          <prosody rate="-8%" pitch="23%">
              ${message}
          </prosody>
      </mstts:express-as>
      <mstts:viseme type="sil"/>
      <mstts:viseme type="sil"/>
  </voice>
  </speak>`;
}

const textToSpeech = async (message: string) => {
  return new Promise((resolve, reject) => {
    const ssml = buildSSML(message);
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisOutputFormat = 5; // mp3
    speechConfig.speechSynthesisVoiceName = AZURE_VOICE_NAME;

    let visemes: { offset: number; id: number }[] = [];

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

    synthesizer.visemeReceived = function (s, e) {
      visemes.push({
        offset: e.audioOffset / 10000,
        id: e.visemeId,
      });
    };

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        const { audioData } = result;
        synthesizer.close()
        const audioBuffer = Buffer.from(audioData);
        resolve({ audioBuffer, visemes });
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

export default textToSpeech;
