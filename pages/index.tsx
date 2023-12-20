import React from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import ZippyAvatar from "@/components/Zippy/ZippyAvatar";
import PaperAirplane from "@/icons/paper-airplane";

interface VisemeFrame {
  offset: number;
  visemeId: number;
}

let TRANSATION_DELAY = 0;
let ttsAudio: HTMLAudioElement;

async function playAudio(setVisemeID: (id: number) => void, audioUrl: string, visemesUrl: string) {
  if (ttsAudio) {
    ttsAudio.pause();
  }
  ttsAudio = new Audio(audioUrl);
  const response = await fetch(new Request(visemesUrl), {
    method: "GET",
    mode: "no-cors",
  });

  const visemes = await response.json();

  ttsAudio.ontimeupdate = () => {
    const currentViseme = visemes.find((frame: VisemeFrame) => {
      return frame.offset - TRANSATION_DELAY <= ttsAudio.currentTime * 1000;
    });
    if (!currentViseme) {
      return;
    }
    setVisemeID(currentViseme.id ?? 0);
  };
  ttsAudio.play();
}

export default function AvatarApp() {
  const [visemeID, setVisemeID] = React.useState(0);
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [text, setText] = React.useState("");
  const [zippySay, setZippySay] = React.useState("");
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

    let synthesisStartTime = 0;
    const player = new SpeechSDK.SpeakerAudioDestination();
    player.onAudioStart = () => {
      setIsDisabled(true);
      synthesisStartTime = Date.now();
    };

    player.onAudioEnd = () => {
      setIsDisabled(false);
    };

    const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
    synthesizer.current = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.current.synthesisCompleted = function (s, e) {
      setIsDisabled(false);
    };

    synthesizer.current.visemeReceived = (s, e) => {
      const visemeTime = synthesisStartTime + e.audioOffset / 10000;
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

  const handleSynthesis = async () => {
    setZippySay("Please wait...");
    setText("");

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      console.error("Error sending message to OpenAI");
      return;
    }

    const data = await response.json();
    const messageFromOpenAI = data.response;

    setZippySay(messageFromOpenAI);

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="en-US-JennyNeural">
            <mstts:viseme type="redlips_front"/>
            <break time="500ms"/>
            <mstts:express-as style="excited">
                <prosody rate="-8%" pitch="23%">
                    ${messageFromOpenAI}
                </prosody>
            </mstts:express-as>
            <mstts:viseme type="sil"/>
            <mstts:viseme type="sil"/>
        </voice>
      </speak>`;

    if (!synthesizer.current) {
      return;
    }

    synthesizer.current.speakSsmlAsync(ssml, (error) => {
      console.log(error);
    });
  };

  return (
    <div className="w-screen h-screen items-center justify-center flex flex-col mx-auto">
      <div className="flux justify-center items-center w-[500px] relative">
        <ZippyAvatar visemeID={visemeID} />
        {zippySay ? (
          <div className="absolute top-[-50px] left-[400px] w-[400px] bg-white p-2 rounded-lg shadow-lg text-xs">
            {zippySay}
          </div>
        ) : null}
      </div>
      <div className="h-10 relative my-4">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          className="border-2 border-gray-300 bg-gray-100 h-10 w-[600px] pl-5 pr-[120px] rounded-lg text-sm focus:outline-none mb-2"
          placeholder="Write something..."
          maxLength={100}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSynthesis();
            }
          }}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r-lg absolute bottom-0 right-0 w-[50px] h-10"
          onClick={() => handleSynthesis()}
          disabled={isDisabled}
        >
          <PaperAirplane />
        </button>
      </div>
    </div>
  );
}
