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
  ttsAudio = new Audio("outputaudio.wav");
  const response = await fetch(new Request("viseme.json"), {
    method: "GET",
    mode: "no-cors",
  });

  const visemes = await response.json();
  console.log(visemes);

  ttsAudio.ontimeupdate = () => {
    const currentViseme = visemes.find((frame: VisemeFrame) => {
      return frame.offset - TRANSATION_DELAY / 2 >= ttsAudio.currentTime * 1000;
    });
    if (!currentViseme) {
      return;
    }
    console.log(`Viseme received: ${currentViseme.id}`);
    setVisemeID(currentViseme.id ?? 0);
  };
  ttsAudio.play();
}

export default playAudio;
