interface VisemeFrame {
  offset: number;
  id: number;
}

let TRANSATION_DELAY = 60;
let ttsAudio: HTMLAudioElement;

async function playAudio(setVisemeID: (id: number) => void) {
  if (ttsAudio) {
    ttsAudio.pause();
  }
  ttsAudio = new Audio("infoAudio.wav");
  const response = await fetch(new Request("visemes.json"), {
    method: "GET",
    mode: "no-cors",
  });

  const visemes = await response.json();

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
