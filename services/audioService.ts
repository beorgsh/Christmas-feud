
// Sound Assets
const SOUNDS = {
  // Reliable Game Show Buzzer (Wrong Answer / Strike)
  buzz: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'
};

class AudioService {
  private buzz: HTMLAudioElement;

  constructor() {
    this.buzz = new Audio(SOUNDS.buzz);
    this.buzz.volume = 1.0; 
  }

  playBuzz() {
    this.buzz.currentTime = 0;
    this.buzz.play().catch(e => console.log("Audio play failed (Buzz)", e));
  }
}

export const audioService = new AudioService();
