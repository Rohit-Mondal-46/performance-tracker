// hooks/useHolistic.js - FIXED VERSION (Video Element Timing Fixed)
import { useEffect, useRef, useState, useCallback } from "react";

const useHolistic = (onResults, onActivityChange, cameraStarted = true) => {
  const videoRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState("Initializing...");
  const [mediaPipeStatus, setMediaPipeStatus] = useState("checking");
  
  // Phone detection hook
  
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
      if (typeof window.Holistic === 'undefined' || typeof window.Camera === 'undefined') {
        throw new Error('MediaPipe Holistic not available. Ensure scripts are loaded in index.html');
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
      const holistic = new window.Holistic({
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
      const BUFFER_SIZE = 3; // Reduced for more responsive detection
      
      holistic.onResults((results) => {
        // Use the ref versions of callbacks
        if (onResultsRef.current) {
          onResultsRef.current(results);
        }
        
        // Enhanced activity detection
        let detectedActivity = 'Idle';
        
        // Check if person is detected at all
        if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
          // No person detected - truly idle
          detectedActivity = 'Idle';
        } else if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          const nose = results.poseLandmarks[0];
          const leftEar = results.poseLandmarks[7];
          const rightEar = results.poseLandmarks[8];
          const leftWrist = results.poseLandmarks[15];
          const rightWrist = results.poseLandmarks[16];
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const leftHip = results.poseLandmarks[23];
          const rightHip = results.poseLandmarks[24];
          
          const hasLeftHand = results.leftHandLandmarks && results.leftHandLandmarks.length > 0;
          const hasRightHand = results.rightHandLandmarks && results.rightHandLandmarks.length > 0;
          const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;
          
          // Calculate distances and positions
          const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
          
          // ENHANCED: Looking Away detection using face landmarks
          let isLookingAway = false;
          if (hasFace && results.faceLandmarks && nose && leftEar && rightEar && leftShoulder && rightShoulder) {
            const centerX = (leftShoulder.x + rightShoulder.x) / 2;
            const noseOffset = Math.abs(nose.x - centerX);
            
            // Check ear visibility (when head turns, one ear becomes less visible)
            const earDistance = Math.abs(leftEar.x - rightEar.x);
            const normalEarDistance = shoulderWidth * 0.5;
            const earDistanceRatio = earDistance / normalEarDistance;
            
            // Check nose vertical position (looking down significantly)
            const isLookingDown = nose.y > leftShoulder.y - 0.1;
            
            // Face landmark indices for better head orientation
            const leftCheek = results.faceLandmarks[234]; // Left cheek
            const rightCheek = results.faceLandmarks[454]; // Right cheek
            
            // Check if head is turned (cheek distance changes)
            const cheekDistance = Math.abs(leftCheek.x - rightCheek.x);
            const normalCheekDistance = shoulderWidth * 0.35;
            const cheekRatio = cheekDistance / normalCheekDistance;
            
            // Head turned significantly left/right OR looking down
            isLookingAway = (
              noseOffset > shoulderWidth * 0.5 || // Head turned sideways
              earDistanceRatio < 0.6 || // One ear hidden (head turned)
              cheekRatio < 0.7 || // Face profile visible
              isLookingDown // Looking down at lap/floor
            );
          }
          
          
          // Enhanced phone detection - hand near ear with proper orientation
          let leftHandNearEar = false;
          if (hasLeftHand && leftWrist && leftEar && results.leftHandLandmarks) {
            const wristToEarDist = Math.sqrt(
              Math.pow(leftWrist.x - leftEar.x, 2) + 
              Math.pow(leftWrist.y - leftEar.y, 2)
            );
            
            // Get hand landmarks for orientation check
            const thumb = results.leftHandLandmarks[4];
            const pinky = results.leftHandLandmarks[20];
            
            // Check if hand is vertical (phone-holding orientation)
            const handIsVertical = Math.abs(thumb.y - pinky.y) > Math.abs(thumb.x - pinky.x) * 1.5;
            
            // Hand near ear at correct height with vertical orientation
            leftHandNearEar = wristToEarDist < 0.15 &&
              leftWrist.y < leftShoulder.y + 0.15 &&
              leftWrist.y > leftEar.y - 0.1 &&
              handIsVertical;
          }
            
          let rightHandNearEar = false;
          if (hasRightHand && rightWrist && rightEar && results.rightHandLandmarks) {
            const wristToEarDist = Math.sqrt(
              Math.pow(rightWrist.x - rightEar.x, 2) + 
              Math.pow(rightWrist.y - rightEar.y, 2)
            );
            
            // Get hand landmarks for orientation check
            const thumb = results.rightHandLandmarks[4];
            const pinky = results.rightHandLandmarks[20];
            
            // Check if hand is vertical (phone-holding orientation)
            const handIsVertical = Math.abs(thumb.y - pinky.y) > Math.abs(thumb.x - pinky.x) * 1.5;
            
            // Hand near ear at correct height with vertical orientation
            rightHandNearEar = wristToEarDist < 0.15 &&
              rightWrist.y < rightShoulder.y + 0.15 &&
              rightWrist.y > rightEar.y - 0.1 &&
              handIsVertical;
          }
          
          // Combined phone detection with confidence scoring
          const phoneDetectionScore =  
            (leftHandNearEar ? 2 : 0) + 
            (rightHandNearEar ? 2 : 0);
          
          const isUsingPhone = phoneDetectionScore >= 2; // Need strong evidence
          
          // Typing detection - both hands at desk level, relatively stationary
          const handsAtTypingHeight = hasLeftHand && hasRightHand && 
            leftWrist && rightWrist && leftShoulder && rightShoulder && leftHip && rightHip &&
            leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y && // Below shoulders
            leftWrist.y < leftHip.y + 0.2 && rightWrist.y < rightHip.y + 0.2 && // At/above hip level (more lenient)
            Math.abs(leftWrist.y - rightWrist.y) < 0.25 && // Similar height (more forgiving)
            Math.abs(leftWrist.x - rightWrist.x) > shoulderWidth * 0.3 && // Hands separated (less strict)
            Math.abs(leftWrist.x - rightWrist.x) < shoulderWidth * 2.5; // Not too far apart (more lenient)
          
          // Writing detection - one hand at desk level, moving
          const leftHandWriting = hasLeftHand && leftWrist && leftShoulder && leftHip &&
            leftWrist.y > leftShoulder.y + 0.05 && // Below shoulder (less strict)
            leftWrist.y < leftHip.y + 0.15 && // At hip level (more lenient)
            Math.abs(leftWrist.x - leftShoulder.x) < shoulderWidth * 1.5; // In front of body (more lenient)
            
          const rightHandWriting = hasRightHand && rightWrist && rightShoulder && rightHip &&
            rightWrist.y > rightShoulder.y + 0.05 && // Below shoulder (less strict)
            rightWrist.y < rightHip.y + 0.15 && // At hip level (more lenient)
            Math.abs(rightWrist.x - rightShoulder.x) < shoulderWidth * 1.5; // In front of body (more lenient)
          
          // Gesturing detection - hand raised above shoulder level
          const leftHandRaised = hasLeftHand && leftWrist && leftShoulder && 
            leftWrist.y < leftShoulder.y - 0.03; // Above shoulder (less strict)
            
          const rightHandRaised = hasRightHand && rightWrist && rightShoulder && 
            rightWrist.y < rightShoulder.y - 0.03; // Above shoulder (less strict)
          
          // Reading detection - sitting upright, hands down, looking at screen
          const isReadingPosture = !hasLeftHand && !hasRightHand && 
            hasFace && !isLookingAway &&
            nose && nose.y < leftShoulder.y; // Head above shoulders
          
          // Activity logic with clear priorities
          if (isUsingPhone) {
            // Phone detected by visual analysis or hand near ear with correct orientation
            detectedActivity = 'Phone';
          } else if (isLookingAway) {
            // Looking away from screen - moved up in priority for better detection
            detectedActivity = 'Looking Away';
          } else if (leftHandRaised || rightHandRaised) {
            // Gesturing - hand raised above shoulder
            detectedActivity = 'Gesturing';
          } else if (handsAtTypingHeight) {
            // Both hands typing
            detectedActivity = 'Typing';
          } else if ((leftHandWriting && !rightHandWriting) || (!leftHandWriting && rightHandWriting)) {
            // One hand writing, other hand not detected or not in writing position
            detectedActivity = 'Writing';
          } else if (leftHandWriting && rightHandWriting && 
                     Math.abs(leftWrist.x - rightWrist.x) < shoulderWidth * 0.5) {
            // Both hands close together (holding paper while writing)
            detectedActivity = 'Writing';
          } else if (isReadingPosture) {
            // Reading - hands not visible, face visible, looking at screen
            detectedActivity = 'Reading';
          } else if ((hasLeftHand || hasRightHand) && !handsAtTypingHeight && !leftHandWriting && !rightHandWriting) {
            // Hands visible but not in any specific activity posture - default to Reading
            detectedActivity = 'Reading';
          } else {
            // No clear activity detected - check if person is present
            detectedActivity = hasFace ? 'Reading' : 'Idle';
          }
        }
        
        // Smooth activity with buffer
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

      const camera = new window.Camera(videoRef.current, {
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
      console.log("✅ Camera and MediaPipe initialized successfully");
      initializingRef.current = false;

    } catch (err) {
      console.error("❌ Initialization error:", err);
      setError(err.message || "Failed to initialize camera");
      setMediaPipeStatus("failed");
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
    mediaPipeStatus
  };
};

export default useHolistic;