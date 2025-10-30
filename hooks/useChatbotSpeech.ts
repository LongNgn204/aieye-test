import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface UseChatbotSpeechProps {
  onResult: (transcript: string) => void;
}

export const useChatbotSpeech = ({ onResult }: UseChatbotSpeechProps) => {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      onResult(finalTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  }, [isRecording, language, onResult, stopRecording]);

  return { isRecording, startRecording };
};
