import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface VoiceControlContextType {
  isVoiceControlEnabled: boolean;
  toggleVoiceControl: () => void;
  isSupported: boolean;
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

// Add type definitions for the Web Speech API
interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onstart: () => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}
type SpeechRecognitionConstructor = new () => ISpeechRecognition;
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isBrowserSupported = !!SpeechRecognition;


export const VoiceControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVoiceControlEnabled, setIsVoiceControlEnabled] = useState(() => {
    if (!isBrowserSupported) return false;
    return localStorage.getItem('voiceControlEnabled') === 'true';
  });

  const toggleVoiceControl = () => {
    if (!isBrowserSupported) return;
    const newState = !isVoiceControlEnabled;
    setIsVoiceControlEnabled(newState);
    localStorage.setItem('voiceControlEnabled', String(newState));
  };
  
  // Ask for permission when the user first enables the feature
  useEffect(() => {
    if (isVoiceControlEnabled) {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        console.error("Microphone permission was denied.", err);
        setIsVoiceControlEnabled(false);
        localStorage.setItem('voiceControlEnabled', 'false');
      });
    }
  }, [isVoiceControlEnabled]);

  return (
    <VoiceControlContext.Provider value={{ isVoiceControlEnabled, toggleVoiceControl, isSupported: isBrowserSupported }}>
      {children}
    </VoiceControlContext.Provider>
  );
};

export const useVoiceControlContext = (): VoiceControlContextType => {
  const context = useContext(VoiceControlContext);
  if (!context) {
    throw new Error('useVoiceControlContext must be used within a VoiceControlProvider');
  }
  return context;
};