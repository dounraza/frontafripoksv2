import { useEffect, useRef, useState } from 'react';

type SoundType = 'allin' | 'call' | 'check' | 'fold' | 'join' | 'raise' | 'share-cards' | 'win' | 'coin-win' | 'show-card';

export const useSound = () => {
  const audioRefs = useRef<{ [key in SoundType]?: HTMLAudioElement }>({});
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('isMuted');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    const sounds: SoundType[] = ['allin', 'call', 'check', 'fold', 'join', 'raise', 'share-cards', 'win', 'coin-win', 'show-card'];
    
    sounds.forEach((sound) => {
      const audio = new Audio(`/sounds/${sound}.wav`);
      audio.preload = 'auto';
      audioRefs.current[sound] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const playSound = (sound: SoundType) => {
    if (isMuted) return;
    
    const audio = audioRefs.current[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.warn(`Lecture audio bloquée/erreur pour ${sound}:`, err));
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      if (!prev) {
        // Arrêter immédiatement tous les sons en cours si on mute
        Object.values(audioRefs.current).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
      return !prev;
    });
  };

  return { playSound, isMuted, toggleMute };
};
