'use client';

import { useCallback, useRef, useState } from 'react';

interface AudioTestOptions {
  frequency: number; // Hz: 250, 500, 1000, 2000, 4000, 8000
  volume: number; // 0-1
  duration?: number; // milliseconds
  onEnd?: () => void;
}

/**
 * Equal Loudness Contour compensation (ISO 226:2003 based)
 * Different frequencies need different gain levels to sound equally loud
 * This ensures all frequencies are perceived at the same loudness level
 */
const getFrequencyGain = (frequency: number): number => {
  // Reference frequency: 1000 Hz at 0 dB
  // Lower frequencies need more gain to sound equally loud
  // Higher frequencies also need slight compensation
  
  if (frequency <= 250) return 1.8; // Bass frequencies need more gain
  if (frequency <= 500) return 1.4;
  if (frequency <= 1000) return 1.0; // Reference
  if (frequency <= 2000) return 0.95;
  if (frequency <= 4000) return 0.9;
  return 0.85; // 8000 Hz
};

/**
 * ReSound-style professional audio generation
 * Uses equal loudness compensation and smooth audio processing
 */
export function useAudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const volumeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AudioContext with optimal settings
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      // Use sample rate 44100 or higher for better quality
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({
        sampleRate: 44100, // Professional audio quality
        latencyHint: 'interactive', // Low latency for real-time control
      });
      
      // Create master gain node for overall volume control
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 1.0;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  // Stop current tone (must be defined before playTone to avoid circular dependency)
  const stopTone = useCallback(() => {
    try {
      // Clear volume update timeout
      if (volumeUpdateTimeoutRef.current) {
        clearTimeout(volumeUpdateTimeoutRef.current);
        volumeUpdateTimeoutRef.current = null;
      }

      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Already stopped, ignore
        }
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      setIsPlaying(false);
      setCurrentFrequency(null);
    } catch (error) {
      console.error('Error stopping tone:', error);
    }
  }, []);

  // Generate and play tone with professional audio processing
  const playTone = useCallback(
    ({ frequency, volume, duration, onEnd }: AudioTestOptions) => {
      try {
        const audioContext = initAudioContext();
        
        // Resume audio context if suspended (required for user interaction)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // Stop any existing tone
        stopTone();

        // Create oscillator with professional settings
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Configure oscillator for clean, professional tone
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine'; // Pure sine wave for hearing test accuracy

        // Apply equal loudness compensation
        const frequencyGain = getFrequencyGain(frequency);
        const compensatedVolume = volume * frequencyGain;
        
        // Clamp to prevent clipping
        const finalVolume = Math.min(compensedVolume, 0.95);

        // ReSound kabi: agar duration berilgan bo'lsa, bir marta ijro etish
        // Agar duration yo'q bo'lsa, doim ijro etish (loop)
        if (duration) {
          // Configure gain (volume) with smooth fade in/out (ReSound style)
          const fadeTime = 0.2; // 200ms smooth fade (ReSound uses longer fade)
          const playTime = duration / 1000;
          
          // Smooth fade in
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + fadeTime);
          
          // Hold at volume
          gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime + playTime - fadeTime);
          
          // Smooth fade out
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + playTime);

          // Connect: oscillator -> gain -> master gain -> destination
          oscillator.connect(gainNode);
          gainNode.connect(masterGainRef.current!);

          // Start playing with duration
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + playTime);

          // Store references
          oscillatorRef.current = oscillator;
          gainNodeRef.current = gainNode;

          // Handle end
          oscillator.onended = () => {
            setIsPlaying(false);
            setCurrentFrequency(null);
            oscillatorRef.current = null;
            gainNodeRef.current = null;
            onEnd?.();
          };
        } else {
          // ReSound kabi: doim ijro etish (loop) - duration yo'q
          // Smooth fade in (ReSound style - longer fade for better UX)
          const fadeTime = 0.2; // 200ms smooth fade
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + fadeTime);
          gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime + fadeTime);

          // Connect: oscillator -> gain -> master gain -> destination
          oscillator.connect(gainNode);
          gainNode.connect(masterGainRef.current!);

          // Store references
          oscillatorRef.current = oscillator;
          gainNodeRef.current = gainNode;

          // Start playing continuously
          oscillator.start(audioContext.currentTime);
          // Don't call stop() - let it play continuously until stopTone() is called
        }

        // Set state
        setIsPlaying(true);
        setCurrentFrequency(frequency);
      } catch (error) {
        console.error('Error playing tone:', error);
        setIsPlaying(false);
        setCurrentFrequency(null);
      }
    },
    [initAudioContext, stopTone]
  );

  // Update volume in real-time (ReSound kabi - ultra smooth)
  const updateVolume = useCallback((newVolume: number) => {
    try {
      if (gainNodeRef.current && isPlaying && currentFrequency !== null) {
        const audioContext = gainNodeRef.current.context;
        
        // Clear existing timeout
        if (volumeUpdateTimeoutRef.current) {
          clearTimeout(volumeUpdateTimeoutRef.current);
        }

        // Debounce rapid updates for smoother performance
        volumeUpdateTimeoutRef.current = setTimeout(() => {
          const clampedVolume = Math.max(0, Math.min(1, newVolume));
          
          // Apply equal loudness compensation
          const frequencyGain = getFrequencyGain(currentFrequency);
          const compensatedVolume = clampedVolume * frequencyGain;
          const finalVolume = Math.min(compensedVolume, 0.95);

          // Ultra-smooth volume transition (ReSound style)
          const fadeTime = 0.05; // 50ms for instant feel but smooth transition
          
          gainNodeRef.current.gain.cancelScheduledValues(audioContext.currentTime);
          gainNodeRef.current.gain.setValueAtTime(
            gainNodeRef.current.gain.value,
            audioContext.currentTime
          );
          gainNodeRef.current.gain.linearRampToValueAtTime(
            finalVolume,
            audioContext.currentTime + fadeTime
          );
        }, 10); // 10ms debounce for performance
      }
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  }, [isPlaying, currentFrequency]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopTone();
    if (volumeUpdateTimeoutRef.current) {
      clearTimeout(volumeUpdateTimeoutRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {
        // Ignore errors on close
      });
      audioContextRef.current = null;
    }
    masterGainRef.current = null;
  }, [stopTone]);

  return {
    playTone,
    stopTone,
    updateVolume,
    cleanup,
    isPlaying,
    currentFrequency,
  };
}

