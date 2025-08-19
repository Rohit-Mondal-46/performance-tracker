// import { useEffect, useRef } from "react";
// import { Hands } from "@mediapipe/hands";

// const useGesture = ({ onSwipeLeft, onSwipeRight }) => {
//   const previousX = useRef(null);
//   const handsRef = useRef(null);

//   useEffect(() => {
//     const handsInstance = new Hands({
//       locateFile: (file) => `${window.location.origin}/mediapipe/hands/${file}`,
//     });

//     handsInstance.setOptions({
//       maxNumHands: 1,
//       modelComplexity: 1,
//       minDetectionConfidence: 0.8,
//       minTrackingConfidence: 0.8,
//     });

//     handsInstance.onResults((results) => {
//       if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
//         const wrist = results.multiHandLandmarks[0][0];
//         if (previousX.current != null) {
//           const dx = wrist.x - previousX.current;
//           if (dx > 0.1) onSwipeRight();
//           else if (dx < -0.1) onSwipeLeft();
//         }
//         previousX.current = wrist.x;
//       }
//     });

//     handsRef.current = handsInstance;

//     return () => {
//       handsRef.current?.close();
//     };
//   }, [onSwipeLeft, onSwipeRight]);

//   return handsRef;
// };

// export default useGesture;


import { useEffect, useRef, useCallback, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const useGesture = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  onPinch,
  onFist,
  onThumbsUp,
  onPeaceSign 
}) => {
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Gesture tracking state
  const previousLandmarks = useRef(null);
  const gestureHistory = useRef([]);
  const cooldownRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(async () => {
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (handsRef.current) {
        await handsRef.current.close();
        handsRef.current = null;
      }
      setIsInitialized(false);
      previousLandmarks.current = null;
      gestureHistory.current = [];
    } catch (err) {
      console.warn("Gesture cleanup error:", err);
    }
  }, []);

  // Initialize MediaPipe Hands
  const initializeHands = useCallback(async () => {
    try {
      await cleanup();

      const isElectron = window && window.process && window.process.versions?.electron;
      const hands = new Hands({
        locateFile: (file) => {
          if (isElectron) {
            return `file://${window.process.cwd()}/public/mediapipe/hands/${file}`;
          } else {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(processHandResults);
      handsRef.current = hands;

      await hands.initialize();
      setIsInitialized(true);
      setError(null);

    } catch (err) {
      console.error("Error initializing Hands:", err);
      setError("Failed to initialize gesture detection");
      setIsInitialized(false);
      throw err;
    }
  }, [cleanup]);

  // Process hand results and detect gestures
  const processHandResults = useCallback((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      previousLandmarks.current = null;
      return;
    }

    const currentLandmarks = results.multiHandLandmarks[0];
    detectGestures(currentLandmarks, results.multiHandedness?.[0]?.label || 'Right');
    
    previousLandmarks.current = currentLandmarks;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onFist, onThumbsUp, onPeaceSign]);

  // Gesture detection logic
  const detectGestures = useCallback((landmarks, handedness) => {
    if (!landmarks || landmarks.length < 21) return;

    // Swipe detection
    detectSwipes(landmarks);

    // Static gesture detection
    if (detectPinch(landmarks) && onPinch) {
      triggerGesture('pinch', onPinch);
    }
    if (detectFist(landmarks) && onFist) {
      triggerGesture('fist', onFist);
    }
    if (detectThumbsUp(landmarks) && onThumbsUp) {
      triggerGesture('thumbs_up', onThumbsUp);
    }
    if (detectPeaceSign(landmarks) && onPeaceSign) {
      triggerGesture('peace_sign', onPeaceSign);
    }

  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onFist, onThumbsUp, onPeaceSign]);

  // Swipe detection
  const detectSwipes = useCallback((landmarks) => {
    if (!previousLandmarks.current) return;

    const wrist = landmarks[0];
    const prevWrist = previousLandmarks.current[0];

    const dx = wrist.x - prevWrist.x;
    const dy = wrist.y - prevWrist.y;

    // Minimum movement threshold
    const threshold = 0.05;
    const speed = Math.sqrt(dx * dx + dy * dy);

    if (speed > threshold && !cooldownRef.current) {
      cooldownRef.current = true;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > threshold && onSwipeRight) {
          triggerGesture('swipe_right', onSwipeRight);
        } else if (dx < -threshold && onSwipeLeft) {
          triggerGesture('swipe_left', onSwipeLeft);
        }
      } else {
        // Vertical swipe
        if (dy > threshold && onSwipeDown) {
          triggerGesture('swipe_down', onSwipeDown);
        } else if (dy < -threshold && onSwipeUp) {
          triggerGesture('swipe_up', onSwipeUp);
        }
      }

      // Cooldown to prevent multiple triggers
      setTimeout(() => {
        cooldownRef.current = false;
      }, 500);
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Static gesture detectors
  const detectPinch = (landmarks) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    return distance < 0.05;
  };

  const detectFist = (landmarks) => {
    // Check if fingers are curled
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerBases = [2, 5, 9, 13, 17];
    
    let curledCount = 0;
    for (let i = 0; i < fingerTips.length; i++) {
      if (landmarks[fingerTips[i]].y > landmarks[fingerBases[i]].y) {
        curledCount++;
      }
    }
    return curledCount >= 4;
  };

  const detectThumbsUp = (landmarks) => {
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMp = landmarks[2];
    
    // Thumb should be extended upward
    const thumbExtended = thumbTip.y < thumbIp.y && thumbIp.y < thumbMp.y;
    
    // Other fingers should be curled
    const otherFingersCurled = [8, 12, 16, 20].every(tip => 
      landmarks[tip].y > landmarks[tip - 2].y
    );

    return thumbExtended && otherFingersCurled;
  };

  const detectPeaceSign = (landmarks) => {
    // Index and middle finger extended, others curled
    const indexExtended = landmarks[8].y < landmarks[6].y;
    const middleExtended = landmarks[12].y < landmarks[10].y;
    const ringCurled = landmarks[16].y > landmarks[14].y;
    const pinkyCurled = landmarks[20].y > landmarks[18].y;
    const thumbCurled = landmarks[4].y > landmarks[3].y;

    return indexExtended && middleExtended && ringCurled && pinkyCurled && thumbCurled;
  };

  // Gesture triggering with cooldown and history
  const triggerGesture = useCallback((gestureType, callback) => {
    const now = Date.now();
    
    // Prevent duplicate gestures within short time
    const recentGesture = gestureHistory.current.find(
      g => g.type === gestureType && now - g.timestamp < 1000
    );
    
    if (!recentGesture) {
      gestureHistory.current.push({ type: gestureType, timestamp: now });
      if (gestureHistory.current.length > 10) {
        gestureHistory.current.shift();
      }
      
      console.log(`Gesture detected: ${gestureType}`);
      callback();
    }
  }, []);

  // Start webcam for gesture detection
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 3) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current.readyState === 4) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (frameErr) {
                console.warn("Frame processing error:", frameErr);
              }
            }
          },
          width: 640,
          height: 480
        });

        await cameraRef.current.start();
      }
    } catch (err) {
      console.error("Webcam error:", err);
      setError("Cannot access webcam for gestures");
      throw err;
    }
  }, []);

  // Main initialization
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await initializeHands();
        if (isMounted) {
          await startWebcam();
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gesture initialization failed:", err);
        }
      }
    };

    // Check if any gesture callbacks are provided
    const hasCallbacks = Object.values({
      onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
      onPinch, onFist, onThumbsUp, onPeaceSign
    }).some(callback => callback);

    if (hasCallbacks) {
      init();
    }

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [initializeHands, startWebcam, cleanup, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onFist, onThumbsUp, onPeaceSign]);

  const restart = useCallback(async () => {
    setError(null);
    try {
      await cleanup();
      await initializeHands();
      await startWebcam();
    } catch (err) {
      setError("Failed to restart gesture detection");
    }
  }, [cleanup, initializeHands, startWebcam]);

  return { 
    videoRef, 
    error, 
    isInitialized, 
    restart,
    currentGesture: gestureHistory.current[gestureHistory.current.length - 1]?.type 
  };
};

export default useGesture;