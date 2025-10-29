// src/components/VoiceStatus.jsx
import React from 'react';
import useVoice from '../hooks/useVoice';

const VoiceStatus = () => {
  const { isListening, isSupported, error } = useVoice({}, { autoStart: true });

  if (!isSupported) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isListening 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : error 
          ? 'bg-red-100 text-red-800 border border-red-300'
          : 'bg-gray-100 text-gray-800 border border-gray-300'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isListening ? 'bg-green-500 animate-pulse' : 
          error ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>
        <span>
          {isListening ? 'Listening...' : error ? 'Mic Error' : 'Voice Ready'}
        </span>
      </div>
    </div>
  );
};

export default VoiceStatus;