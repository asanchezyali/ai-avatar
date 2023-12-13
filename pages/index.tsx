import React from "react";
import ZippyAvatar from "@/components/Zippy/ZippyAvatar";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export default function Home() {
  const [visemeID, setVisemeID] = React.useState(0);
  const [isDisabled, setIsDisabled] = React.useState(false);

  const [text, setText] = React.useState("");
  const synthesizer = React.useRef<SpeechSDK.SpeechSynthesizer | null>(null);

  if (!process.env.NEXT_PUBLIC_SPEECH_KEY || !process.env.NEXT_PUBLIC_SPEECH_REGION) {
    throw new Error("Speech service credentials are not defined.");
  }

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_SPEECH_KEY,
    process.env.NEXT_PUBLIC_SPEECH_REGION
  );

  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

  const player = new SpeechSDK.SpeakerAudioDestination();
  player.onAudioStart = () => {
    console.log("Audio started");
    setIsDisabled(true);
  };

  player.onAudioEnd = () => {
    console.log("Audio ended");
    setIsDisabled(false);
  };

  const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
  synthesizer.current = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  synthesizer.current.synthesisStarted = function (s, e) {
    console.log("Synthesis started");
  };

  synthesizer.current.synthesisCompleted = function (s, e) {
    console.log("Synthesis completed");
    setIsDisabled(false);
  };
  let accumulatedOffset = 0;

  synthesizer.current.visemeReceived = (s, e) => {
    setTimeout(() => {
      accumulatedOffset += e.audioOffset / 10000;
      setVisemeID(e.visemeId);
    }, e.audioOffset / 10000 + 700);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleSynthesis = () => {
    if (!synthesizer.current) {
      return;
    }

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-US-JennyNeural">
        <mstts:viseme type="redlips_front"/>
        <mstts:express-as style="excited">
            <prosody rate="-8%" pitch="23%">
                ${text}
            </prosody>
        </mstts:express-as>
    </voice>
  </speak>`;

    synthesizer.current.speakSsmlAsync(
      ssml,
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return (
    <div className="w-[500px] h-screen items-center justify-center flex flex-col mx-auto">
      <ZippyAvatar visemeID={visemeID} />
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none mb-2"
        placeholder="Text"
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleSynthesis()}
        disabled={isDisabled}
      >
        Synthesis
      </button>
    </div>
  );
}
