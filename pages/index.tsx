import React from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import ZippyAvatar from "@/components/Zippy/ZippyAvatar";
import sendMessageToPALM from "@/api/PALM";
import PaperAirplane from "@/icons/paper-airplane";

export default function AvatarApp() {
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

  React.useEffect(() => {
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

    let audioStartTime = 0;
    const player = new SpeechSDK.SpeakerAudioDestination();
    player.onAudioStart = () => {
      console.log("Audio started");
      setIsDisabled(true);
      audioStartTime = Date.now();
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

    synthesizer.current.visemeReceived = (s, e) => {
      const visemeTime = audioStartTime + e.audioOffset / 10000;
      const delay = visemeTime - Date.now();
      setTimeout(
        () => {
          setVisemeID(e.visemeId);
        },
        delay > 0 ? delay : 0
      );
    };
  }, [speechConfig]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleSynthesis = () => {
    sendMessageToPALM(text).then((response) => {
      console.log(response);

      if (!synthesizer.current) {
        return;
      }

      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="en-US-JennyNeural">
            <mstts:viseme type="redlips_front"/>
            <mstts:express-as style="excited">
                <prosody rate="-8%" pitch="23%">
                    ${response}
                </prosody>
            </mstts:express-as>
        </voice>
      </speak>`;

      synthesizer.current.speakSsmlAsync(
        ssml,
        (result) => {
          setText("");
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };

  return (
    <div className="w-[500px] h-screen items-center justify-center flex flex-col mx-auto">
      <ZippyAvatar visemeID={visemeID} />
      <div className="h-10 relative">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          className="border-2 border-gray-300 bg-gray-100 h-10 w-[600px] pl-5 pr-[120px] rounded-lg text-sm focus:outline-none mb-2"
          placeholder="Write something..."
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg absolute bottom-0 right-0 w-[100px]"
          onClick={() => handleSynthesis()}
          disabled={isDisabled}
        >
          <PaperAirplane />
        </button>
      </div>
    </div>
  );
}
