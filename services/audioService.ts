
// Sound Assets
const SOUNDS = {
  // Classic Family Feud "Ding" (Correct Answer / Reveal)
  ding: 'https://www.myinstants.com/media/sounds/family-feud-clang.mp3',
  
  // Reliable Game Show Buzzer (Wrong Answer / Strike)
  buzz: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',

  // Upbeat Christmas Background Music
  bgMusic: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=christmas-magic-126456.mp3'
};

class AudioService {
  private bgMusic: HTMLAudioElement;
  private ding: HTMLAudioElement;
  private buzz: HTMLAudioElement;
  private isMusicPlaying: boolean = false;

  constructor() {
    // Initialize Music
    this.bgMusic = new Audio(SOUNDS.bgMusic);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3; // Gentle background level

    // Initialize SFX
    this.ding = new Audio(SOUNDS.ding);
    this.ding.volume = 0.8;

    this.buzz = new Audio(SOUNDS.buzz);
    this.buzz.volume = 1.0; 
  }

  playDing() {
    this.ding.currentTime = 0;
    this.ding.play().catch(e => console.log("Audio play failed (Ding)", e));
  }

  playBuzz() {
    this.buzz.currentTime = 0;
    this.buzz.play().catch(e => console.log("Audio play failed (Buzz)", e));
  }

  toggleMusic(shouldPlay: boolean) {
    this.isMusicPlaying = shouldPlay;
    if (shouldPlay) {
      this.bgMusic.play().catch(e => console.log("Music play failed - browser might require interaction first", e));
    } else {
      this.bgMusic.pause();
    }
  }
}

export const audioService = new AudioService();
