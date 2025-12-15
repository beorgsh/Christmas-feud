
// Sound Assets
const SOUNDS = {
  // Reliable "Ding" / Correct Answer (Mixkit source is stable and CORS-friendly)
  ding: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
  
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
    // Explicitly load to ensure readiness
    this.ding.load();

    this.buzz = new Audio(SOUNDS.buzz);
    this.buzz.volume = 1.0; 
    this.buzz.load();
  }

  playDing() {
    this.ding.currentTime = 0;
    const promise = this.ding.play();
    
    if (promise !== undefined) {
      promise.catch(e => {
        console.warn("Audio play failed (Ding). Check browser autoplay policy or network.", e);
        // Attempt to reload if it failed
        this.ding.load();
      });
    }
  }

  playBuzz() {
    this.buzz.currentTime = 0;
    const promise = this.buzz.play();
    
    if (promise !== undefined) {
      promise.catch(e => console.warn("Audio play failed (Buzz)", e));
    }
  }

  toggleMusic(shouldPlay: boolean) {
    this.isMusicPlaying = shouldPlay;
    if (shouldPlay) {
      const promise = this.bgMusic.play();
      if (promise !== undefined) {
         promise.catch(e => console.warn("Music play failed - browser might require interaction first", e));
      }
    } else {
      this.bgMusic.pause();
    }
  }
}

export const audioService = new AudioService();
