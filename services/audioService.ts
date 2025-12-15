
// Sound Assets
const SOUNDS = {
  // Reliable "Ding" / Correct Answer
  ding: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
  
  // LOUD Game Show Buzzer (Wrong Answer / Strike) - Sharper and louder than before
  buzz: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',

  // Upbeat Christmas Background Music (Classic Holiday Vibe)
  bgMusic: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b79ce425.mp3?filename=christmas-spirit-10488.mp3'
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
    this.bgMusic.volume = 0.25; // Balanced volume for background

    // Initialize SFX
    this.ding = new Audio(SOUNDS.ding);
    this.ding.volume = 0.8;
    this.ding.load();

    this.buzz = new Audio(SOUNDS.buzz);
    this.buzz.volume = 1.0; // Max volume for the loud buzzer
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
