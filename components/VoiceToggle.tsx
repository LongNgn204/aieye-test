import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceControlContext } from '../context/VoiceControlContext';
import { useLanguage } from '../context/LanguageContext';

interface VoiceToggleProps {
  isOpen: boolean;
}

export const VoiceToggle: React.FC<VoiceToggleProps> = ({ isOpen }) => {
  const { isVoiceControlEnabled, toggleVoiceControl, isSupported } = useVoiceControlContext();
  const { t } = useLanguage();
  
  if (!isSupported) {
    return null;
  }

  return (
    <div className={`p-3 rounded-lg transition-colors flex items-center gap-4 ${isVoiceControlEnabled ? 'bg-green-100' : 'bg-gray-100'} ${isOpen ? '' : 'justify-center'}`}>
      <div className={`flex items-center gap-4 ${isOpen ? '' : 'justify-center'}`}>
          <div className={isVoiceControlEnabled ? 'text-green-700' : 'text-gray-600'}>
            {isVoiceControlEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </div>
          {isOpen && <span className="font-medium text-gray-800 whitespace-nowrap">{t('voice_control_toggle')}</span>}
      </div>
      {isOpen && (
        <button
          onClick={toggleVoiceControl}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ml-auto ${isVoiceControlEnabled ? 'bg-green-600' : 'bg-gray-400'}`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isVoiceControlEnabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      )}
    </div>
  );
};