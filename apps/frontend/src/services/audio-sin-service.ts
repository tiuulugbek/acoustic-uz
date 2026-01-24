/**
 * Speech-in-Noise Audio Service
 * Handles mixing speech (digits) with background noise at specified SNR
 */

// Use native AudioBuffer type

export class SpeechInNoiseAudioService {
  private audioContext: AudioContext;
  private speechBuffers: Map<string, AudioBuffer> = new Map();
  private noiseBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({
      sampleRate: 44100,
      latencyHint: 'interactive',
    });
    
    // Create master gain for overall volume control
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.audioContext.destination);
  }

  /**
   * Initialize audio context (required for user interaction)
   */
  async initialize(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Load speech audio files (digits 0-9)
   * For now, we'll generate synthetic digits using Web Speech API or TTS
   * In production, these should be pre-recorded professional audio files
   */
  async loadSpeechFiles(locale: 'uz' | 'ru' = 'uz'): Promise<void> {
    // TODO: Load actual audio files from /assets/audio/digits/{locale}/
    // For now, we'll use Web Speech API to generate digits on-the-fly
    // In production, use pre-recorded professional audio files
    
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const digitNames: Record<string, string> = {
      uz: {
        '0': 'nol',
        '1': 'bir',
        '2': 'ikki',
        '3': 'uch',
        '4': 'to\'rt',
        '5': 'besh',
        '6': 'olti',
        '7': 'yetti',
        '8': 'sakkiz',
        '9': 'to\'qqiz',
      },
      ru: {
        '0': 'ноль',
        '1': 'один',
        '2': 'два',
        '3': 'три',
        '4': 'четыре',
        '5': 'пять',
        '6': 'шесть',
        '7': 'семь',
        '8': 'восемь',
        '9': 'девять',
      },
    };

    // For now, we'll create placeholder buffers
    // In production, load actual WAV files
    for (const digit of digits) {
      const buffer = this.createSilentBuffer(0.5); // 0.5 second placeholder
      this.speechBuffers.set(digit, buffer);
    }
  }

  /**
   * Generate white noise buffer
   */
  async generateNoise(duration: number = 10): Promise<void> {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = Math.floor(duration * sampleRate);
    
    const buffer = this.audioContext.createBuffer(2, bufferSize, sampleRate);
    
    // Generate white noise
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        // White noise: random values between -1 and 1
        data[i] = Math.random() * 2 - 1;
      }
    }
    
    this.noiseBuffer = buffer;
  }

  /**
   * Mix triplet of digits with noise at specified SNR
   * @param digits Array of 3 digits (e.g., ['1', '2', '3'])
   * @param snr Signal-to-Noise Ratio in dB
   * @param ear 'left', 'right', or 'both'
   */
  async playTriplet(
    digits: string[],
    snr: number,
    ear: 'left' | 'right' | 'both' = 'both'
  ): Promise<void> {
    if (digits.length !== 3) {
      throw new Error('Triplet must contain exactly 3 digits');
    }

    await this.initialize();

    // Mix speech triplet
    const speechBuffer = this.mixTriplet(digits);
    
    if (!this.noiseBuffer) {
      await this.generateNoise(10);
    }

    // Calculate gains based on SNR
    // Reference speech level: 65 dB SPL
    const speechLevelDB = 65;
    const noiseLevelDB = speechLevelDB - snr;
    
    // Convert dB to linear gain
    const speechGain = Math.pow(10, speechLevelDB / 20) * 0.1; // Scale down for Web Audio
    const noiseGain = Math.pow(10, noiseLevelDB / 20) * 0.1;

    // Create sources
    const speechSource = this.audioContext.createBufferSource();
    const noiseSource = this.audioContext.createBufferSource();
    
    const speechGainNode = this.audioContext.createGain();
    const noiseGainNode = this.audioContext.createGain();
    
    const merger = this.audioContext.createChannelMerger(2);
    const splitter = this.audioContext.createChannelSplitter(2);

    // Set gains
    speechGainNode.gain.value = speechGain;
    noiseGainNode.gain.value = noiseGain;

    // Set buffers
    speechSource.buffer = speechBuffer;
    noiseSource.buffer = this.noiseBuffer!;

    // Route to appropriate channels based on ear
    speechSource.connect(speechGainNode);
    noiseSource.connect(noiseGainNode);
    
    if (ear === 'left') {
      speechGainNode.connect(merger, 0, 0);
      noiseGainNode.connect(merger, 0, 0);
      // Right channel silent
      const silentGain = this.audioContext.createGain();
      silentGain.gain.value = 0;
      silentGain.connect(merger, 0, 1);
    } else if (ear === 'right') {
      speechGainNode.connect(merger, 0, 1);
      noiseGainNode.connect(merger, 0, 1);
      // Left channel silent
      const silentGain = this.audioContext.createGain();
      silentGain.gain.value = 0;
      silentGain.connect(merger, 0, 0);
    } else {
      // Both ears
      speechGainNode.connect(merger, 0, 0);
      speechGainNode.connect(merger, 0, 1);
      noiseGainNode.connect(merger, 0, 0);
      noiseGainNode.connect(merger, 0, 1);
    }

    merger.connect(this.masterGain!);

    // Play
    const startTime = this.audioContext.currentTime;
    speechSource.start(startTime);
    noiseSource.start(startTime);

    const duration = speechBuffer.duration;
    speechSource.stop(startTime + duration);
    noiseSource.stop(startTime + duration + 0.5);

    // Wait for playback to complete
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, (duration + 0.5) * 1000);
    });
  }

  /**
   * Mix three digit audio buffers into a single triplet
   */
  private mixTriplet(digits: string[]): AudioBuffer {
    const buffers = digits.map((d) => this.speechBuffers.get(d)!);
    const gap = 0.3; // 300ms gap between digits
    
    const totalDuration = buffers.reduce((sum, b) => sum + b.duration, 0) + 
                          gap * (buffers.length - 1);
    
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.ceil(totalDuration * sampleRate);
    const mixed = this.audioContext.createBuffer(2, length, sampleRate);
    
    let offset = 0;
    buffers.forEach((buffer) => {
      const numChannels = Math.min(buffer.numberOfChannels, 2);
      for (let channel = 0; channel < numChannels; channel++) {
        const sourceData = buffer.getChannelData(channel);
        const destData = mixed.getChannelData(channel);
        
        for (let i = 0; i < sourceData.length; i++) {
          if (offset + i < destData.length) {
            destData[offset + i] = sourceData[i];
          }
        }
      }
      // Fill remaining channels if mono
      if (numChannels === 1) {
        const sourceData = buffer.getChannelData(0);
        const destData = mixed.getChannelData(1);
        for (let i = 0; i < sourceData.length; i++) {
          if (offset + i < destData.length) {
            destData[offset + i] = sourceData[i];
          }
        }
      }
      offset += buffer.length + Math.ceil(gap * sampleRate);
    });
    
    return mixed;
  }

  /**
   * Create silent buffer (placeholder until real audio files are loaded)
   */
  private createSilentBuffer(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.floor(duration * sampleRate);
    return this.audioContext.createBuffer(2, length, sampleRate);
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
  }
}
