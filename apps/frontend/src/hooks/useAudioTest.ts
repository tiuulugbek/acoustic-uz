'use client';

import { useCallback, useRef, useState } from 'react';

interface AudioTestOptions {
  frequency: number; // Hz: 250, 500, 1000, 2000, 4000, 8000
  volume: number; // 0-1
  duration?: number; // milliseconds
  onEnd?: () => void;
}

export function useAudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate and play tone
  const playTone = useCallback(
    ({ frequency, volume, duration = 2000, onEnd }: AudioTestOptions) => {
      try {
        const audioContext = initAudioContext();
        
        // Resume audio context if suspended (required for user interaction)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // Stop any existing tone
        stopTone();

        // Create oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Configure oscillator
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine'; // Pure tone

        // Configure gain (volume)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + duration / 1000 - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Store references
        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;

        // Set state
        setIsPlaying(true);
        setCurrentFrequency(frequency);

        // Start playing
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);

        // Handle end
        oscillator.onended = () => {
          setIsPlaying(false);
          setCurrentFrequency(null);
          oscillatorRef.current = null;
          gainNodeRef.current = null;
          onEnd?.();
        };
      } catch (error) {
        console.error('Error playing tone:', error);
        setIsPlaying(false);
        setCurrentFrequency(null);
      }
    },
    [initAudioContext]
  );

  // Stop current tone
  const stopTone = useCallback(() => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
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

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopTone();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopTone]);

  return {
    playTone,
    stopTone,
    cleanup,
    isPlaying,
    currentFrequency,
  };
}

