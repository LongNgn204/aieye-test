import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Augment the window object with the SpeechRecognition API types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const useChatbotSpeech = () => {
    const { language } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = false; // We want to stop after a single utterance
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(prev => prev + finalTranscript);
            };
            
            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);
    
    useEffect(() => {
        if(recognitionRef.current) {
            recognitionRef.current.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        }
    }, [language]);


    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if(recognitionRef.current) {
                setTranscript(''); // Clear previous transcript
                recognitionRef.current.start();
                setIsListening(true);
            } else {
                alert("Speech recognition is not supported on your browser.");
            }
        }
    }, [isListening]);

    return { isListening, transcript, toggleListening };
};