// src/hooks/useVoice.js
import { useEffect, useState, useCallback, useRef } from 'react';

// Check if we're in Electron
const isElectron = window && window.process && window.process.versions?.electron;

// Mock SpeechRecognition for Electron or unsupported browsers
const createSpeechRecognitionMock = () => ({
  startListening: () => console.log('Speech recognition would start (mock)'),
  stopListening: () => console.log('Speech recognition would stop (mock)'),
  useSpeechRecognition: () => ({
    transcript: '',
    listening: false,
    browserSupportsSpeechRecognition: false,
    isMicrophoneAvailable: false,
    resetTranscript: () => {}
  })
});

// Use mock in Electron or real library in browser
let SpeechRecognition;
let useSpeechRecognition;

if (isElectron) {
  // Use mock in Electron environment
  SpeechRecognition = createSpeechRecognitionMock();
  useSpeechRecognition = () => ({
    transcript: '',
    listening: false,
    browserSupportsSpeechRecognition: false,
    isMicrophoneAvailable: false,
    resetTranscript: () => {}
  });
} else {
  // Use real library in browser
  try {
    SpeechRecognition = require('react-speech-recognition');
    useSpeechRecognition = SpeechRecognition.useSpeechRecognition;
  } catch (error) {
    console.warn('react-speech-recognition not available, using mock');
    SpeechRecognition = createSpeechRecognitionMock();
    useSpeechRecognition = () => ({
      transcript: '',
      listening: false,
      browserSupportsSpeechRecognition: false,
      isMicrophoneAvailable: false,
      resetTranscript: () => {}
    });
  }
}

const useVoice = (commands = {}, options = {}) => {
  const {
    continuous = true,
    autoStart = true,
    commandTimeout = 2000,
    debug = false
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [lastCommand, setLastCommand] = useState('');
  const timeoutRef = useRef(null);

  // Use the library's hook (or mock in Electron)
  const {
    transcript,
    listening: isListening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript
  } = useSpeechRecognition({ commands: {} }); // We'll handle commands manually

  // Check support and microphone availability
  useEffect(() => {
    setIsSupported(browserSupportsSpeechRecognition);
    
    if (!browserSupportsSpeechRecognition) {
      setError(isElectron 
        ? 'Speech recognition limited in Electron. Use keyboard shortcuts instead.' 
        : 'Speech recognition not supported in this browser'
      );
    } else if (!isMicrophoneAvailable) {
      setError('Microphone not available. Please check permissions.');
    } else {
      setError(null);
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  // Process commands manually
  useEffect(() => {
    if (!transcript.trim() || !isListening) return;

    if (debug) console.log('Speech detected:', transcript);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Process command after a short delay
    timeoutRef.current = setTimeout(() => {
      const normalizedTranscript = transcript.toLowerCase().trim();
      let commandExecuted = false;

      Object.entries(commands).forEach(([command, callback]) => {
        const normalizedCommand = command.toLowerCase().trim();
        
        // Exact match
        if (normalizedTranscript === normalizedCommand) {
          executeCommand(command, callback, normalizedTranscript);
          commandExecuted = true;
          resetTranscript();
          return;
        }

        // Phrase contains command
        if (normalizedTranscript.includes(normalizedCommand)) {
          executeCommand(command, callback, normalizedTranscript);
          commandExecuted = true;
          resetTranscript();
          return;
        }

        // Aliases support
        if (typeof callback === 'object' && callback.aliases) {
          const hasAlias = callback.aliases.some(alias => 
            normalizedTranscript.includes(alias.toLowerCase())
          );
          if (hasAlias) {
            executeCommand(command, callback.action || callback, normalizedTranscript);
            commandExecuted = true;
            resetTranscript();
            return;
          }
        }
      });

      if (!commandExecuted && debug) {
        console.log('No matching command found for:', transcript);
      }

    }, commandTimeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [transcript, isListening, commands, commandTimeout, debug, resetTranscript]);

  // Execute command
  const executeCommand = (commandName, callback, transcript) => {
    try {
      if (typeof callback === 'function') {
        if (debug) console.log(`Executing command: ${commandName}`);
        callback(transcript);
        setLastCommand(commandName);
      } else if (callback && typeof callback.action === 'function') {
        if (debug) console.log(`Executing command: ${commandName}`);
        callback.action(transcript);
        setLastCommand(commandName);
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      setError(`Error executing command: ${error.message}`);
    }
  };

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    try {
      SpeechRecognition.startListening({ continuous });
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setError('Failed to start voice recognition');
    }
  }, [isSupported, isListening, continuous]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (isListening) {
      try {
        SpeechRecognition.stopListening();
        resetTranscript();
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }
  }, [isListening, resetTranscript]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && isSupported && !isListening && isMicrophoneAvailable) {
      startListening();
    }
  }, [autoStart, isSupported, isListening, isMicrophoneAvailable, startListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    error,
    lastCommand,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isMicrophoneAvailable,
    browserSupportsSpeechRecognition: isSupported,
    status: isListening ? 'listening' : error ? 'error' : 'idle',
    isElectron // Add this flag so components know they're in Electron
  };
};

// Alternative: Use the library's built-in command system
export const useVoiceNative = (commands = {}, options = {}) => {
  const {
    continuous = true,
    autoStart = true,
    debug = false
  } = options;

  const [lastCommand, setLastCommand] = useState('');

  const {
    transcript,
    listening: isListening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript
  } = useSpeechRecognition({ commands });

  // Track last command
  useEffect(() => {
    if (transcript && Object.keys(commands).some(cmd => transcript.toLowerCase().includes(cmd.toLowerCase()))) {
      setLastCommand(transcript);
    }
  }, [transcript, commands]);

  // Auto-start
  useEffect(() => {
    if (autoStart && browserSupportsSpeechRecognition && isMicrophoneAvailable && !isListening) {
      SpeechRecognition.startListening({ continuous });
    }
  }, [autoStart, browserSupportsSpeechRecognition, isMicrophoneAvailable, isListening, continuous]);

  return {
    isListening,
    isSupported: browserSupportsSpeechRecognition,
    error: !browserSupportsSpeechRecognition ? 'Browser not supported' : 
           !isMicrophoneAvailable ? 'Microphone not available' : null,
    lastCommand,
    transcript,
    startListening: () => SpeechRecognition.startListening({ continuous }),
    stopListening: SpeechRecognition.stopListening,
    toggleListening: () => isListening ? 
      SpeechRecognition.stopListening() : 
      SpeechRecognition.startListening({ continuous }),
    isMicrophoneAvailable,
    isElectron
  };
};

export default useVoice;