import { useCallback, useRef } from 'react';

interface SoundEffect {
  frequency: number;
  type: OscillatorType;
  duration: number;
  volume?: number;
}

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((config: SoundEffect) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      oscillator.type = config.type;

      gainNode.gain.setValueAtTime(config.volume || 0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
    } catch (error) {
      // Audio context might not be available
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  const sounds = {
    eat: () => playSound({ frequency: 800, type: 'sine', duration: 0.1, volume: 0.2 }),
    powerup: () => playSound({ frequency: 1200, type: 'square', duration: 0.3, volume: 0.15 }),
    gameStart: () => {
      setTimeout(() => playSound({ frequency: 400, type: 'triangle', duration: 0.1 }), 0);
      setTimeout(() => playSound({ frequency: 600, type: 'triangle', duration: 0.1 }), 100);
      setTimeout(() => playSound({ frequency: 800, type: 'triangle', duration: 0.2 }), 200);
    },
    gameOver: () => {
      setTimeout(() => playSound({ frequency: 400, type: 'sawtooth', duration: 0.2 }), 0);
      setTimeout(() => playSound({ frequency: 300, type: 'sawtooth', duration: 0.2 }), 200);
      setTimeout(() => playSound({ frequency: 200, type: 'sawtooth', duration: 0.4 }), 400);
    },
    death: () => playSound({ frequency: 150, type: 'sawtooth', duration: 0.5, volume: 0.3 }),
    move: () => playSound({ frequency: 200, type: 'square', duration: 0.05, volume: 0.05 }),
  };

  return sounds;
}