interface VisemeFrame {
  offset: number;
  id: number;
}

interface playAudioProps {
  setVisemeID: (id: number) => void;
  audioBuffer: { data: Uint8Array };
  visemes: VisemeFrame[];
}

let TRANSATION_DELAY = 60;
let ttsAudio: HTMLAudioElement;

async function playAudio({ setVisemeID, visemes, audioBuffer }: playAudioProps) {
  if (ttsAudio) {
    ttsAudio.pause();
  }
  const arrayBuffer = Uint8Array.from(audioBuffer.data).buffer;
  const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  ttsAudio = new Audio(url);

  ttsAudio.ontimeupdate = () => {
    const currentViseme = visemes.find((frame: VisemeFrame) => {
      return frame.offset - TRANSATION_DELAY / 2 >= ttsAudio.currentTime * 1000;
    });
    if (!currentViseme) {
      return;
    }
    setVisemeID(currentViseme.id);
  };

  ttsAudio.onended = () => {
    setVisemeID(0);
  };

  ttsAudio.play();
}

export default playAudio;
