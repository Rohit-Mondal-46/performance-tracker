import React, { useState, useEffect } from 'react';
import useVoice from '../hooks/useVoice';

const VoiceControl = ({ onSwitchOrg, onGoHome, onNext, onPrevious, expanded = false }) => {
  const [showCommands, setShowCommands] = useState(expanded);
  const [recentActivity, setRecentActivity] = useState([]);

  const voiceCommands = {
    'switch organization': onSwitchOrg,
    'go home': onGoHome,
    'next': onNext,
    'previous': onPrevious,
    'next slide': onNext,
    'previous slide': onPrevious,
    'move forward': onNext,
    'move back': onPrevious,
    'show commands': () => setShowCommands(true),
    'hide commands': () => setShowCommands(false),
    'toggle commands': () => setShowCommands(prev => !prev)
  };

  const {
    isListening,
    isSupported,
    error,
    lastCommand,
    startListening,
    stopListening,
    toggleListening
  } = useVoice(voiceCommands, {
    autoStart: true,
    continuous: true,
    debug: process.env.NODE_ENV === 'development'
  });

  // Track recent activity
  useEffect(() => {
    if (lastCommand) {
      setRecentActivity(prev => [
        { command: lastCommand, timestamp: new Date(), type: 'success' },
        ...prev.slice(0, 4) // Keep last 5 items
      ]);
    }
  }, [lastCommand]);

  // Add error to recent activity
  useEffect(() => {
    if (error) {
      setRecentActivity(prev => [
        { command: error, timestamp: new Date(), type: 'error' },
        ...prev.slice(0, 4)
      ]);
    }
  }, [error]);

  if (!isSupported) {
    return (
      <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-yellow-700">⚠️</span>
          <p className="text-sm text-yellow-800">Voice commands not supported in this browser</p>
        </div>
        <p className="text-xs text-yellow-600 mt-1">
          Please use Chrome, Edge, or Safari for voice control
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isListening ? 'bg-green-500 animate-pulse' : 
            error ? 'bg-red-500' : 'bg-blue-500'
          }`}></div>
          <h3 className="font-semibold text-gray-800">Voice Control</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title={showCommands ? 'Hide commands' : 'Show commands'}
          >
            {showCommands ? '▲' : '▼'}
          </button>
          <button
            onClick={toggleListening}
            className={`p-1 rounded transition-colors ${
              isListening 
                ? 'text-red-600 hover:text-red-800' 
                : 'text-green-600 hover:text-green-800'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? '🔇' : '🎤'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <p className={`text-sm ${
          isListening ? 'text-green-600 font-medium' : 
          error ? 'text-red-600' : 'text-gray-600'
        }`}>
          {isListening ? '🎤 Listening...' : 
           error ? `❌ ${error}` : '✅ Ready - Say a command'}
        </p>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Recent:</p>
          <div className="space-y-1">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`text-xs px-2 py-1 rounded ${
                  activity.type === 'error' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {activity.command}
                <span className="text-gray-500 ml-2">
                  {activity.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Commands (Collapsible) */}
      {showCommands && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Available Commands:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries({
              'Navigation': ['go home', 'switch organization'],
              'Presentation': ['next', 'previous', 'next slide', 'previous slide'],
              'Control': ['show commands', 'hide commands', 'toggle commands']
            }).map(([category, commands]) => (
              <div key={category}>
                <p className="text-xs font-medium text-gray-600 mb-1">{category}:</p>
                <div className="space-y-1">
                  {commands.map(command => (
                    <span
                      key={command}
                      className="inline-block bg-white border border-blue-200 rounded px-2 py-1 text-xs text-blue-700 mr-1 mb-1"
                    >
                      "{command}"
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Speak clearly and wait for the feedback sound
        </p>
        {!isListening && (
          <button
            onClick={startListening}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Start listening
          </button>
        )}
      </div>
    </div>
  );
};

// Default props for optional callbacks
VoiceControl.defaultProps = {
  onSwitchOrg: () => console.log('Switch organization command'),
  onGoHome: () => console.log('Go home command'),
  onNext: () => console.log('Next command'),
  onPrevious: () => console.log('Previous command')
};

export default VoiceControl;
