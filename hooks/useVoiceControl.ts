import { useEffect, useRef, useCallback, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceControlContext } from '../context/VoiceControlContext';

interface Command {
    keywords: string[];
    callback: (params?: any) => void;
}

interface useVoiceControlOptions {
    commands: Command[];
    onNoMatch?: (transcript: string) => void;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useVoiceControl = ({ commands, onNoMatch }: useVoiceControlOptions) => {
    const { isVoiceControlEnabled } = useVoiceControlContext();
    const { language } = useLanguage();
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef<any>(null);

    // Use refs to store handlers and state to prevent stale closures in callbacks
    const handlersRef = useRef({ commands, onNoMatch });
    useEffect(() => {
        handlersRef.current = { commands, onNoMatch };
    }, [commands, onNoMatch]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && isVoiceControlEnabled) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                 // It might already be started, which is fine.
            }
        }
    }, [isVoiceControlEnabled]);


    useEffect(() => {
        if (!isVoiceControlEnabled) {
            return;
        }

        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported by this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            const transcript = finalTranscript.toLowerCase().trim();
            if (!transcript) return;
            
            const { commands, onNoMatch } = handlersRef.current;
            let matched = false;
            
            for (const command of commands) {
                for (const keyword of command.keywords) {
                    if (transcript.includes(keyword.toLowerCase())) {
                        command.callback(transcript);
                        matched = true;
                        break;
                    }
                }
                if (matched) break;
            }

            if (!matched && onNoMatch) {
                onNoMatch(transcript);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
             // Robust restart loop only if the feature is still enabled
            if (isVoiceControlEnabled) {
               setTimeout(() => startListening(), 100); 
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error(`Speech recognition error: ${event.error}`);
            }
        };

        startListening();

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [isVoiceControlEnabled, language, startListening]);

    return { isListening };
};