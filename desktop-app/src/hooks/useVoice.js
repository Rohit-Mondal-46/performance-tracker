// import { useEffect } from 'react';

// const useVoice = (commands) => {
//   useEffect(() => {
//     if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();

//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//       // Match command keys
//       Object.keys(commands).forEach((key) => {
//         if (transcript.includes(key.toLowerCase())) {
//           commands[key](); // execute mapped function
//         }
//       });
//     };

//     recognition.start();

//     return () => recognition.stop();
//   }, [commands]);
// };
// export default useVoice;


// src/hooks/useVoice.js
import { useEffect, useState, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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

  // Use the library's hook
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
      setError('Speech recognition not supported in this browser');
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
    status: isListening ? 'listening' : error ? 'error' : 'idle'
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
    isMicrophoneAvailable
  };
};

export default useVoice;