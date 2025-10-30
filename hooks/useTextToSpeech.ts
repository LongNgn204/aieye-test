import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

// --- Helper Functions for Audio Processing ---

// Decodes a base64 string into a Uint8Array.
function decodeBase64(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer for playback.
// The Gemini TTS API returns raw 24000Hz 1-channel PCM data.
async function decodePcmData(
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> {
  // The raw data is 16-bit little-endian PCM.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const numChannels = 1;
  const sampleRate = 24000;
  
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    // Normalize the 16-bit integer to a float between -1.0 and 1.0
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
}


export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Initialize AudioContext and GoogleGenAI client
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error("API_KEY for Text-to-Speech is not set.");
    }

    return () => {
        // Cleanup on unmount
        if (sourceRef.current) {
          sourceRef.current.onended = null;
          sourceRef.current.stop();
        }
        audioContextRef.current?.close();
    }
  }, []);

  const cancel = useCallback(() => {
    if (sourceRef.current) {
       sourceRef.current.onended = null; // Prevent onended from firing on manual cancel
       sourceRef.current.stop();
       sourceRef.current = null;
    }
    if (isPlayingRef.current) {
        isPlayingRef.current = false;
        setIsPlaying(false);
    }
  }, []);
  
  const speak = useCallback(async (text: string, lang: 'vi-VN' | 'en-GB') => {
    if (!text || isPlayingRef.current || !aiRef.current || !audioContextRef.current) {
      return;
    }
    
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    
    cancel(); 
    
    isPlayingRef.current = true;
    setIsPlaying(true);

    try {
      const voiceName = lang === 'vi-VN' ? 'Kore' : 'Puck';

      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio && audioContextRef.current) {
        const audioBytes = decodeBase64(base64Audio);
        const audioBuffer = await decodePcmData(audioBytes, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            // Only update state if this onended call is for the current source
            if (sourceRef.current === source) {
                isPlayingRef.current = false;
                setIsPlaying(false);
                sourceRef.current = null;
            }
        };
        source.start(0);
        sourceRef.current = source;
      } else {
        throw new Error("No audio data received from API.");
      }
    } catch (error) {
      console.error("Text-to-Speech failed:", error);
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, [cancel]);

  return { speak, cancel, isPlaying };
};