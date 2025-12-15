
// Sound Assets
// We use a list for music to provide fallbacks if one CDN fails.
// Mixing Archive.org and Wikimedia for maximum redundancy.
const MUSIC_TRACKS = [
  // 1. Jingle Bells (Archive.org)
  'https://archive.org/download/Kevin_MacLeod_-_Jingle_Bells/Kevin_MacLeod_-_Jingle_Bells.mp3',
  // 2. Jingle Bells (Wikimedia Backup)
  'https://upload.wikimedia.org/wikipedia/commons/e/e9/Jingle_Bells_%28Kevin_MacLeod%29_%28ISRC_USUAN1100187%29.mp3',
  // 3. Deck the Halls (Archive.org)
  'https://archive.org/download/Deck_the_Halls_1489/Kevin_MacLeod_-_Deck_the_Halls.mp3',
  // 4. We Wish You a Merry Christmas (Archive.org)
  'https://archive.org/download/We_Wish_You_a_Merry_Christmas_1365/Kevin_MacLeod_-_We_Wish_You_a_Merry_Christmas.mp3'
];

const SOUNDS = {
  // DING: Correct Answer (Mixkit)
  ding: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  
  // BUZZ: Error/Fail Sound (Mixkit)
  buzz: 'https://assets.mixkit.co/active_storage/sfx/946/946-preview.mp3'
};

class AudioService {
  private bgMusic: HTMLAudioElement | null = null;
  private ding: HTMLAudioElement | null = null;
  private buzz: HTMLAudioElement | null = null;
  
  private isInitialized: boolean = false;
  private isMusicPlaying: boolean = false;
  private audioContext: AudioContext | null = null;
  private currentMusicIndex: number = 0;

  initialize() {
    if (this.isInitialized) return;

    console.log("Initializing Audio Service...");

    try {
      // Initialize Web Audio Context for synthetic fallbacks (Buzzer)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }

      // --- Music Setup with Fallback ---
      this.bgMusic = new Audio();
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.2; // Background volume
      this.bgMusic.preload = 'auto';
      
      // Explicitly nullify crossOrigin to avoid CORS checks for simple playback
      this.bgMusic.crossOrigin = null; 

      // Handle Music Loading Errors (Try next track)
      this.bgMusic.onerror = (e) => {
        const src = this.bgMusic?.src;
        const err = this.bgMusic?.error;
        console.warn(`Music track failed [Index ${this.currentMusicIndex}]: ${src}`, err);
        this.playNextMusicTrack();
      };

      // Start loading the first track
      if (MUSIC_TRACKS.length > 0) {
        this.bgMusic.src = MUSIC_TRACKS[0];
        this.bgMusic.load();
      }

      // --- Ding Setup ---
      this.ding = new Audio(SOUNDS.ding);
      this.ding.volume = 0.8; 

      // --- Buzz Setup ---
      this.buzz = new Audio(SOUNDS.buzz);
      this.buzz.volume = 0.8;
      
      this.ding.load();
      this.buzz.load();

      this.isInitialized = true;
    } catch (e) {
      console.error("Failed to initialize audio:", e);
    }
  }

  private playNextMusicTrack() {
    if (!this.bgMusic) return;
    
    this.currentMusicIndex++;
    
    if (this.currentMusicIndex < MUSIC_TRACKS.length) {
      console.log(`Switching to backup music source: ${this.currentMusicIndex}`);
      this.bgMusic.src = MUSIC_TRACKS[this.currentMusicIndex];
      this.bgMusic.load();
      
      // If we were supposed to be playing, try playing the new track
      if (this.isMusicPlaying) {
        const playPromise = this.bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.warn("Autoplay blocked during fallback switch", e));
        }
      }
    } else {
      console.error("All music tracks failed to load. Giving up on background music.");
    }
  }

  // Fallback: Generate a nasty buzzer sound using Web Audio API if the MP3 fails
  private playSyntheticBuzz() {
    if (!this.audioContext) return;
    
    // Resume context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(e => console.warn("Failed to resume audio context", e));
    }

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.4);
    } catch (e) {
      console.error("Synthetic buzz failed:", e);
    }
  }

  playDing() {
    if (!this.isInitialized) this.initialize();
    
    // Resume context if needed
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    if (this.ding) {
      const clone = this.ding.cloneNode() as HTMLAudioElement;
      clone.volume = 0.8;
      clone.play().catch(e => console.warn("Ding play error:", e));
    }
  }

  playBuzz() {
    if (!this.isInitialized) this.initialize();
    
    // Resume context if needed
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    
    // Try playing the MP3 file first
    if (this.buzz) {
      try {
        const clone = this.buzz.cloneNode() as HTMLAudioElement;
        clone.volume = 0.8;
        const promise = clone.play();
        
        if (promise !== undefined) {
            promise
            .catch(e => {
                console.warn("Buzz file play failed, using synthetic fallback:", e);
                this.playSyntheticBuzz();
            });
        }
      } catch (e) {
        this.playSyntheticBuzz();
      }
    } else {
        this.playSyntheticBuzz();
    }
  }

  toggleMusic(shouldPlay: boolean) {
    if (!this.isInitialized) this.initialize();
    if (!this.bgMusic) return;
    
    // Always attempt to resume AudioContext on user interaction
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    this.isMusicPlaying = shouldPlay;
    
    if (shouldPlay) {
      const playPromise = this.bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Music playback failed. Interaction required.", e);
        });
      }
    } else {
      this.bgMusic.pause();
    }
  }
}

export const audioService = new AudioService();
