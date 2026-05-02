import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type SoundType = 'allin' | 'call' | 'check' | 'fold' | 'join' | 'raise' | 'share-cards' | 'win' | 'coin-win' | 'show-card';

interface SoundContextType {
  playSound: (sound: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRefs = useRef<{ [key in SoundType]?: HTMLAudioElement }>({});
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('isMuted');
    return saved ? JSON.parse(saved) : false;
  });

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

  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  const playSound = (sound: SoundType) => {
    if (isMuted) return;
    
    const audio = audioRefs.current[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.warn(`Lecture audio bloquée: ${sound}`, err));
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        Object.values(audioRefs.current).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
      return next;
    });
  };

  return (
    <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
