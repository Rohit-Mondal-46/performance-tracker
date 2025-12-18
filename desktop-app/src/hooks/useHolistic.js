

// hooks/useHolistic.js - FIXED VERSION (Video Element Timing Fixed)
import { useEffect, useRef, useState, useCallback } from "react";

const useHolistic = (onResults, onActivityChange, cameraStarted = true) => {
  const videoRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState("Initializing...");
  const [mediaPipeStatus, setMediaPipeStatus] = useState("checking");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  // Store callbacks in refs to avoid dependency issues
  const onResultsRef = useRef(onResults);
  const onActivityChangeRef = useRef(onActivityChange);
  
  // Update refs when callbacks change (without triggering re-initialization)
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);
  
  useEffect(() => {
    onActivityChangeRef.current = onActivityChange;
  }, [onActivityChange]);

  // Store holistic and camera instances
  const holisticRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const initializingRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("Cleaning up resources...");
    
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.warn("Camera stop error:", e);
      }
      cameraRef.current = null;
    }
    
    if (holisticRef.current) {
      try {
        holisticRef.current.close();
      } catch (e) {
        console.warn("Holistic close error:", e);
      }
      holisticRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    initializingRef.current = false;
  }, []);

  // Initialize function - NO dependencies on callbacks
  const initialize = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log("Already initializing, skipping...");
      return;
    }

    try {
      initializingRef.current = true;
      console.log("Starting initialization...");
      setError(null);
      setMediaPipeStatus("loading");
      cleanup();
      
      // CRITICAL: Wait for video element to be mounted
      if (!videoRef.current) {
        console.log("Waiting for video element...");
        await new Promise((resolve, reject) => {
          const maxAttempts = 30; // 3 seconds max (reduced from 5)
          let attempts = 0;
          
          const checkVideo = setInterval(() => {
            attempts++;
            console.log(`Checking for video element... attempt ${attempts}/${maxAttempts}`);
            if (videoRef.current) {
              clearInterval(checkVideo);
              console.log("✅ Video element found!");
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkVideo);
              reject(new Error("Video element not mounted after 3 seconds. Please ensure camera is started."));
            }
          }, 100);
        });
      } else {
        console.log("✅ Video element already available");
      }
      
      // Wait for MediaPipe in Electron
      if (window.electronAPI) {
        console.log("Loading MediaPipe via Electron...");
        await window.electronAPI.loadMediaPipe();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check if MediaPipe is available
      if (typeof Holistic === 'undefined' || typeof Camera === 'undefined') {
        throw new Error('MediaPipe Holistic not available. Please check script loading.');
      }

      // Get camera access
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Video element disappeared during initialization");
      }

      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Video load timeout")), 10000);
        
        const checkReady = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            clearTimeout(timeout);
            resolve();
          }
        };
        
        // Check immediately
        checkReady();
        
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Video load error"));
          };
        }
      });

      console.log("Video ready, initializing Holistic...");

      // Initialize Holistic
      const holistic = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }
      });

      holisticRef.current = holistic;

      holistic.setOptions({
        modelComplexity: 0,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        enableSegmentation: false,
        smoothSegmentation: false,
      });

      // Activity detection with smoothing
      const activityBuffer = [];
      const BUFFER_SIZE = 3; // Reduced for faster response
      
      holistic.onResults((results) => {
        // Use the ref versions of callbacks
        if (onResultsRef.current) {
          onResultsRef.current(results);
        }
        
        // Enhanced activity detection
        let detectedActivity = 'Idle';
        
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          const nose = results.poseLandmarks[0];
          const leftEar = results.poseLandmarks[7];
          const rightEar = results.poseLandmarks[8];
          const leftWrist = results.poseLandmarks[15];
          const rightWrist = results.poseLandmarks[16];
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const leftElbow = results.poseLandmarks[13];
          const rightElbow = results.poseLandmarks[14];
          const leftHip = results.poseLandmarks[23];
          const rightHip = results.poseLandmarks[24];
          
          const hasLeftHand = results.leftHandLandmarks && results.leftHandLandmarks.length > 0;
          const hasRightHand = results.rightHandLandmarks && results.rightHandLandmarks.length > 0;
          
          // Calculate distances and positions
          const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
          
          // Enhanced phone detection - hand near ear, elevated position
          const leftHandNearEar = hasLeftHand && leftWrist && leftEar && 
            Math.abs(leftWrist.x - leftEar.x) < 0.15 && 
            Math.abs(leftWrist.y - leftEar.y) < 0.2 &&
            leftWrist.y < leftShoulder.y; // Hand above shoulder
            
          const rightHandNearEar = hasRightHand && rightWrist && rightEar && 
            Math.abs(rightWrist.x - rightEar.x) < 0.15 && 
            Math.abs(rightWrist.y - rightEar.y) < 0.2 &&
            rightWrist.y < rightShoulder.y; // Hand above shoulder
          
          // Gesturing detection - hand raised and away from body
          const leftHandRaised = hasLeftHand && leftWrist && leftShoulder && 
            leftWrist.y < leftShoulder.y && // Above shoulder
            Math.abs(leftWrist.x - leftShoulder.x) > shoulderWidth * 0.3; // Away from body
            
          const rightHandRaised = hasRightHand && rightWrist && rightShoulder && 
            rightWrist.y < rightShoulder.y && // Above shoulder
            Math.abs(rightWrist.x - rightShoulder.x) > shoulderWidth * 0.3; // Away from body
          
          // Writing detection - hand in front of body, at desk level
          const leftHandWriting = hasLeftHand && leftWrist && leftShoulder && leftHip &&
            leftWrist.y > leftShoulder.y && // Below shoulder
            leftWrist.y < leftHip.y && // Above hip (desk level)
            leftWrist.z < -0.15 && // Hand forward (z-depth)
            Math.abs(leftWrist.x - leftShoulder.x) < shoulderWidth * 0.8; // In front of body
            
          const rightHandWriting = hasRightHand && rightWrist && rightShoulder && rightHip &&
            rightWrist.y > rightShoulder.y && // Below shoulder
            rightWrist.y < rightHip.y && // Above hip (desk level)
            rightWrist.z < -0.15 && // Hand forward (z-depth)
            Math.abs(rightWrist.x - rightShoulder.x) < shoulderWidth * 0.8; // In front of body
          
          // Typing detection - both hands at typing position
          const handsAtTypingHeight = hasLeftHand && hasRightHand && 
            leftWrist && rightWrist && leftShoulder && rightShoulder && leftHip && rightHip &&
            leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y && // Below shoulders
            leftWrist.y < leftHip.y && rightWrist.y < rightHip.y && // Above hips
            Math.abs(leftWrist.y - rightWrist.y) < 0.15 && // Similar height
            leftWrist.z < -0.1 && rightWrist.z < -0.1 && // Both hands forward
            Math.abs(leftWrist.x - rightWrist.x) > shoulderWidth * 0.5; // Hands spread apart
          
          // Activity logic with clear priorities
          if (leftHandNearEar || rightHandNearEar) {
            // Phone call - hand near ear
            detectedActivity = 'Phone';
          } else if (leftHandRaised || rightHandRaised) {
            // Gesturing - hand raised and away from body
            detectedActivity = 'Gesturing';
          } else if (handsAtTypingHeight) {
            // Both hands typing
            detectedActivity = 'Typing';
          } else if ((leftHandWriting && !hasRightHand) || (rightHandWriting && !hasLeftHand)) {
            // One hand writing (other hand not visible)
            detectedActivity = 'Writing';
          } else if (hasLeftHand && hasRightHand) {
            // Both hands visible but not in specific positions
            detectedActivity = 'Gesturing';
          } else if (hasLeftHand || hasRightHand) {
            // One hand visible - could be gesturing or resting
            const wrist = hasLeftHand ? leftWrist : rightWrist;
            const shoulder = hasLeftHand ? leftShoulder : rightShoulder;
            
            if (wrist.y < shoulder.y) {
              // Hand above shoulder - probably gesturing
              detectedActivity = 'Gesturing';
            } else {
              // Hand below shoulder - resting or idle
              detectedActivity = 'Idle';
            }
          } else {
            // No hands visible
            detectedActivity = 'Sitting';
          }
        }
        
        // Smooth activity with buffer (smaller buffer for faster response)
        activityBuffer.push(detectedActivity);
        if (activityBuffer.length > BUFFER_SIZE) {
          activityBuffer.shift();
        }
        
        // Get most common activity in buffer
        const activityCounts = {};
        activityBuffer.forEach(act => {
          activityCounts[act] = (activityCounts[act] || 0) + 1;
        });
        
        const smoothedActivity = Object.keys(activityCounts).reduce((a, b) => 
          activityCounts[a] > activityCounts[b] ? a : b
        );
        
        setCurrentActivity(smoothedActivity);
        if (onActivityChangeRef.current) {
          onActivityChangeRef.current(smoothedActivity);
        }
      });

      await holistic.initialize();
      console.log("Holistic initialized");

      // Start camera processing
      if (!videoRef.current) {
        throw new Error("Video element lost before camera start");
      }

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (holisticRef.current && videoRef.current) {
            try {
              await holisticRef.current.send({ image: videoRef.current });
            } catch (err) {
              console.warn('Frame processing error:', err);
            }
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current = camera;
      await camera.start();
      
      setIsInitialized(true);
      setMediaPipeStatus("loaded");
      setIsUsingFallback(false);
      console.log("✅ Camera and MediaPipe initialized successfully");
      initializingRef.current = false;

    } catch (err) {
      console.error("❌ Initialization error:", err);
      setError(err.message || "Failed to initialize camera");
      setMediaPipeStatus("failed");
      setIsUsingFallback(true);
      cleanup();
    }
  }, [cleanup]);

  // Restart function
  const restart = useCallback(() => {
    console.log("Restarting...");
    setIsInitialized(false);
    setError(null);
    setCurrentActivity("Restarting...");
    cleanup();
    // Small delay before re-initializing
    setTimeout(() => {
      initialize();
    }, 500);
  }, [initialize, cleanup]);

  // Initialize on mount ONLY - with proper timing
  useEffect(() => {
    // Don't initialize if camera hasn't been started yet
    if (!cameraStarted) {
      console.log("Waiting for camera to be started...");
      setCurrentActivity("Not Started");
      return;
    }

    let mounted = true;
    
    const init = async () => {
      // Wait for video element to be rendered in DOM
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (mounted) {
        await initialize();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, [cameraStarted, initialize, cleanup]); // Re-run when cameraStarted changes

  return { 
    videoRef, 
    error, 
    isInitialized, 
    currentActivity,
    restart,
    mediaPipeStatus,
    isUsingFallback
  };
};

export default useHolistic;