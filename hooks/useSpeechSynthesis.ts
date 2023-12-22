import React from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export interface VisemeFrame {
  offset: number;
  id: number;
}

export default function useSpeechSynthesis() {
  const [visemeID, setVisemeID] = React.useState(0);
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [text, setText] = React.useState("");
  const [avatarSay, setAvatarSay] = React.useState("");
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
        delay > 0 ? delay + 500 : 0
      );
    };
  }, [speechConfig]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleSynthesis = async () => {
    setAvatarSay("Please wait...");
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
    console.log(messageFromOpenAI);

    setAvatarSay(messageFromOpenAI);

    const ssml = `<speak version="1.0"
        xmlns="http://www.w3.org/2001/10/synthesis"
        xmlns:mstts="https://www.w3.org/2001/mstts"
        xml:lang="en-US">
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

  return { visemeID, setVisemeID, isDisabled, text, avatarSay, handleTextChange, handleSynthesis };
}
