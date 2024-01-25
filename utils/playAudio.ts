interface VisemeFrame {
  offset: number;
  id: number;
}

interface playAudioProps {
  setVisemeID: (id: number) => void;
  audioFile: string;
  visemes: VisemeFrame[];
}

let TRANSATION_DELAY = 60;
let ttsAudio: HTMLAudioElement;

async function playAudio({ setVisemeID, visemes, audioFile }: playAudioProps) {
  if (ttsAudio) {
    ttsAudio.pause();
  }
  ttsAudio = new Audio(audioFile);

  ttsAudio.ontimeupdate = () => {
    const currentViseme = visemes.find((frame: VisemeFrame) => {
      return frame.offset - TRANSATION_DELAY / 2 >= ttsAudio.currentTime * 1000;
    });
    if (!currentViseme) {
      return;
    }
    setVisemeID(currentViseme.id ?? 0);
  };
  ttsAudio.play();
}

export default playAudio;
