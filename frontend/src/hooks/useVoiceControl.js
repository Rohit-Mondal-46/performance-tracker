import { useState, useCallback, useEffect } from 'react';

const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleVoiceCommand = useCallback((command) => {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Implement your voice commands here
    if (normalizedCommand.includes('dashboard')) {
      // Navigate to dashboard
      console.log('Navigating to dashboard');
    } else if (normalizedCommand.includes('reports')) {
      // Navigate to reports
      console.log('Navigating to reports');
    }
    // Add more commands as needed
  }, []);

  useEffect(() => {
    let recognition;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
        
        // Check if the transcript contains a command
        if (transcript.includes('stop listening')) {
          setIsListening(false);
          recognition.stop();
        } else {
          handleVoiceCommand(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [handleVoiceCommand]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.start();
      setIsListening(true);
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
};

export default useVoiceControl;