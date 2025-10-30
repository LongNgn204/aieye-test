import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Volume2, VolumeX, Globe, Check } from 'lucide-react';
import { ChatbotService } from '../services/chatbotService';
import { StorageService } from '../services/storageService';
import { ChatMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const storageService = new StorageService();

export const Chatbot: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotService, setChatbotService] = useState<ChatbotService | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(() => localStorage.getItem('ttsEnabled') === 'true');
  const [selectedVoice, setSelectedVoice] = useState<'vi-VN' | 'en-GB'>(() => (localStorage.getItem('chatbotVoice') as 'vi-VN' | 'en-GB') || 'vi-VN');
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { speak, cancel } = useTextToSpeech();
  
  useEffect(() => {
    if (isOpen) {
      const history = storageService.getTestHistory();
      if(process.env.API_KEY) {
        setChatbotService(new ChatbotService(process.env.API_KEY, history));
      }
      setMessages([
        { sender: 'bot', text: t('chatbot_welcome'), timestamp: new Date().toISOString() }
      ]);
    } else {
      cancel();
    }
  }, [isOpen, t, cancel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    const lastMessage = messages[messages.length - 1];
    if (isTtsEnabled && lastMessage && lastMessage.sender === 'bot') {
      speak(lastMessage.text, selectedVoice);
    }

  }, [messages, isTtsEnabled, speak, selectedVoice]);

  const toggleTts = () => {
    const newState = !isTtsEnabled;
    setIsTtsEnabled(newState);
    localStorage.setItem('ttsEnabled', String(newState));
    if (!newState) {
      cancel();
    }
  };
  
  const handleVoiceChange = (voice: 'vi-VN' | 'en-GB') => {
    setSelectedVoice(voice);
    localStorage.setItem('chatbotVoice', voice);
    setVoiceMenuOpen(false);
  };

  const handleSend = async () => {
    if (userInput.trim() === '' || isLoading || !chatbotService) return;
    
    const userMessage: ChatMessage = {
      sender: 'user',
      text: userInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const botResponse = await chatbotService.sendMessage(userMessage.text);
    setMessages(prev => [...prev, botResponse]);
    setIsLoading(false);
  };
  
  if (!process.env.API_KEY) {
      return null;
  }

  return (
    <>
      <div className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          aria-label={t('chatbot_button_aria')}
        >
          <MessageSquare size={28} />
        </button>
      </div>

      <div className={`fixed bottom-8 right-8 z-50 w-full max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bot className="text-blue-600" /> {t('chatbot_title')}
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={toggleTts} className="text-gray-500 hover:text-gray-800" title={t('chatbot_tts_toggle')}>
              {isTtsEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <div className="relative">
                <button onClick={() => setVoiceMenuOpen(prev => !prev)} className="text-gray-500 hover:text-gray-800" title={t('chatbot_voice_select_title')}>
                    <Globe size={22} />
                </button>
                {voiceMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                        <p className="p-2 text-xs font-semibold text-gray-500 border-b">{t('chatbot_voice_select_title')}</p>
                        <button onClick={() => handleVoiceChange('vi-VN')} className="w-full text-left px-3 py-2 text-sm flex items-center justify-between text-gray-700 hover:bg-gray-100">
                            {t('chatbot_voice_vietnamese')}
                            {selectedVoice === 'vi-VN' && <Check size={16} className="text-blue-600" />}
                        </button>
                        <button onClick={() => handleVoiceChange('en-GB')} className="w-full text-left px-3 py-2 text-sm flex items-center justify-between text-gray-700 hover:bg-gray-100">
                            {t('chatbot_voice_uk_english')}
                            {selectedVoice === 'en-GB' && <Check size={16} className="text-blue-600" />}
                        </button>
                    </div>
                )}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-white"/></div>}
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0"><User size={18} className="text-gray-600"/></div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-white"/></div>
                <div className="max-w-[80%] p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-sm flex items-center gap-2">
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></span>
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chatbot_placeholder')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || userInput.trim() === ''} className="bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-400">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};