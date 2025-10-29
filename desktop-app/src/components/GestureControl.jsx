// components/GestureControl.jsx
import React, { useState, useEffect, useRef } from 'react';
import useGesture from '../hooks/useGesture';

const GestureControl = ({ 
  onNext, 
  onPrevious, 
  onSwipeUp, 
  onSwipeDown,
  onPinch,
  onFist,
  onThumbsUp,
  onPeaceSign,
  showVideo = false 
}) => {
  const videoRef = useRef(null);
  const [gestureStatus, setGestureStatus] = useState('Initializing...');
  const [lastGesture, setLastGesture] = useState(null);
  const [gestureCount, setGestureCount] = useState(0);

  const { 
    error, 
    isInitialized, 
    restart,
    currentGesture 
  } = useGesture({
    onSwipeLeft: () => {
      setLastGesture('← Swipe Left');
      setGestureCount(prev => prev + 1);
      if (onPrevious) onPrevious();
    },
    onSwipeRight: () => {
      setLastGesture('→ Swipe Right');
      setGestureCount(prev => prev + 1);
      if (onNext) onNext();
    },
    onSwipeUp: () => {
      setLastGesture('↑ Swipe Up');
      setGestureCount(prev => prev + 1);
      if (onSwipeUp) onSwipeUp();
    },
    onSwipeDown: () => {
      setLastGesture('↓ Swipe Down');
      setGestureCount(prev => prev + 1);
      if (onSwipeDown) onSwipeDown();
    },
    onPinch: () => {
      setLastGesture('🤏 Pinch');
      setGestureCount(prev => prev + 1);
      if (onPinch) onPinch();
    },
    onFist: () => {
      setLastGesture('✊ Fist');
      setGestureCount(prev => prev + 1);
      if (onFist) onFist();
    },
    onThumbsUp: () => {
      setLastGesture('👍 Thumbs Up');
      setGestureCount(prev => prev + 1);
      if (onThumbsUp) onThumbsUp();
    },
    onPeaceSign: () => {
      setLastGesture('✌️ Peace Sign');
      setGestureCount(prev => prev + 1);
      if (onPeaceSign) onPeaceSign();
    }
  }, videoRef); // Pass videoRef as second parameter

  // Update status based on initialization state
  useEffect(() => {
    if (error) {
      setGestureStatus(`Error: ${error}`);
    } else if (isInitialized) {
      setGestureStatus('Active - Show your hand 👋');
    } else {
      setGestureStatus('Initializing gesture detection...');
    }
  }, [error, isInitialized]);

  // Clear last gesture after 3 seconds
  useEffect(() => {
    if (lastGesture) {
      const timer = setTimeout(() => {
        setLastGesture(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [lastGesture]);

  const getStatusColor = () => {
    if (error) return 'bg-red-100 border-red-300 text-red-800';
    if (isInitialized) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (isInitialized) return '✅';
    return '⏳';
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-red-800">Gesture Control</h3>
          <span className="text-red-600">❌</span>
        </div>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={restart}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-lg">👋</span>
          Gesture Control
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()} {isInitialized ? 'Active' : 'Initializing'}
        </div>
      </div>

      {/* Video Preview (optional) */}
      {showVideo && (
        <div className="mb-4 relative">
          <video
            ref={videoRef}
            className="w-32 h-32 rounded border border-gray-300 object-cover"
            autoPlay
            muted
            playsInline
          />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
            Live
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{gestureStatus}</p>
        
        {lastGesture && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded mb-2">
            <p className="text-sm font-medium text-blue-800">
              Last gesture: <span className="font-bold">{lastGesture}</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Gestures detected: {gestureCount}</span>
          {!isInitialized && (
            <span className="animate-pulse">Loading AI models...</span>
          )}
        </div>
      </div>

      {/* Gesture Guide */}
      <div className="border-t pt-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Available Gestures:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>←</span>
            <span className="text-gray-600">Previous</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>→</span>
            <span className="text-gray-600">Next</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>🤏</span>
            <span className="text-gray-600">Pinch</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>👍</span>
            <span className="text-gray-600">Thumbs Up</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>✊</span>
            <span className="text-gray-600">Fist</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>✌️</span>
            <span className="text-gray-600">Peace</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>↑</span>
            <span className="text-gray-600">Swipe Up</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded">
            <span>↓</span>
            <span className="text-gray-600">Swipe Down</span>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>Hand detection: {isInitialized ? 'Active' : 'Inactive'}</span>
        </div>
        {currentGesture && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Current: {currentGesture}</span>
          </div>
        )}
      </div>

      {/* Restart Button */}
      {isInitialized && (
        <button
          onClick={restart}
          className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
        >
          Restart Detection
        </button>
      )}
    </div>
  );
};

export default GestureControl;