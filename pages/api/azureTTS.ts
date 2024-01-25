import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const AZURE_SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
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
  const ssml = buildSSML(message);
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
  speechConfig.speechSynthesisOutputFormat = 5; // mp3
  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

  let audioConfig = null;

  let randomString = Math.random().toString(36).slice(2, 7);
  let filename = `./public/speech-${randomString}.mp3`;

  audioConfig = SpeechSDK.AudioConfig.fromAudioFileOutput(filename);

  let visemes: { offset: number; id: number }[] = [];

  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  synthesizer.visemeReceived = function (s, e) {
    visemes.push({
      offset: e.audioOffset / 10000,
      id: e.visemeId,
    });
  };

  await new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        resolve(result);
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });

  return {
    visemes,
    filename: `speech-${randomString}.mp3`
  };
};

export default textToSpeech;
