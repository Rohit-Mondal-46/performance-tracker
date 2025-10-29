// // hooks/useGesture.js
// import { useEffect, useRef, useCallback, useState } from "react";

// const useGesture = ({ 
//   onSwipeLeft, 
//   onSwipeRight, 
//   onSwipeUp, 
//   onSwipeDown,
//   onPinch,
//   onFist,
//   onThumbsUp,
//   onPeaceSign 
// }) => {
//   const videoRef = useRef(null);
//   const handsRef = useRef(null);
//   const cameraRef = useRef(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [error, setError] = useState(null);

//   // Gesture tracking state
//   const previousLandmarks = useRef(null);
//   const gestureHistory = useRef([]);
//   const cooldownRef = useRef(false);

//   // Store callbacks in refs to avoid dependency issues
//   const callbacksRef = useRef({
//     onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
//     onPinch, onFist, onThumbsUp, onPeaceSign
//   });

//   // Update callbacks ref when they change
//   useEffect(() => {
//     callbacksRef.current = {
//       onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
//       onPinch, onFist, onThumbsUp, onPeaceSign
//     };
//   }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onFist, onThumbsUp, onPeaceSign]);

//   // Cleanup function
//   const cleanup = useCallback(async () => {
//     try {
//       if (cameraRef.current) {
//         cameraRef.current.stop();
//         cameraRef.current = null;
//       }
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//         videoRef.current.srcObject = null;
//       }
//       if (handsRef.current) {
//         await handsRef.current.close();
//         handsRef.current = null;
//       }
//       setIsInitialized(false);
//       previousLandmarks.current = null;
//       gestureHistory.current = [];
//     } catch (err) {
//       console.warn("Gesture cleanup error:", err);
//     }
//   }, []);

//   // Static gesture detectors (moved outside to avoid dependencies)
//   const detectPinch = useCallback((landmarks) => {
//     const thumbTip = landmarks[4];
//     const indexTip = landmarks[8];
//     const distance = Math.sqrt(
//       Math.pow(thumbTip.x - indexTip.x, 2) + 
//       Math.pow(thumbTip.y - indexTip.y, 2)
//     );
//     return distance < 0.05;
//   }, []);

//   const detectFist = useCallback((landmarks) => {
//     const fingerTips = [4, 8, 12, 16, 20];
//     const fingerBases = [2, 5, 9, 13, 17];
    
//     let curledCount = 0;
//     for (let i = 0; i < fingerTips.length; i++) {
//       if (landmarks[fingerTips[i]].y > landmarks[fingerBases[i]].y) {
//         curledCount++;
//       }
//     }
//     return curledCount >= 4;
//   }, []);

//   const detectThumbsUp = useCallback((landmarks) => {
//     const thumbTip = landmarks[4];
//     const thumbIp = landmarks[3];
//     const thumbMp = landmarks[2];
    
//     const thumbExtended = thumbTip.y < thumbIp.y && thumbIp.y < thumbMp.y;
    
//     const otherFingersCurled = [8, 12, 16, 20].every(tip => 
//       landmarks[tip].y > landmarks[tip - 2].y
//     );

//     return thumbExtended && otherFingersCurled;
//   }, []);

//   const detectPeaceSign = useCallback((landmarks) => {
//     const indexExtended = landmarks[8].y < landmarks[6].y;
//     const middleExtended = landmarks[12].y < landmarks[10].y;
//     const ringCurled = landmarks[16].y > landmarks[14].y;
//     const pinkyCurled = landmarks[20].y > landmarks[18].y;
//     const thumbCurled = landmarks[4].y > landmarks[3].y;

//     return indexExtended && middleExtended && ringCurled && pinkyCurled && thumbCurled;
//   }, []);

//   // Gesture triggering with cooldown and history
//   const triggerGesture = useCallback((gestureType, transcript) => {
//     const now = Date.now();
    
//     const recentGesture = gestureHistory.current.find(
//       g => g.type === gestureType && now - g.timestamp < 1000
//     );
    
//     if (!recentGesture) {
//       gestureHistory.current.push({ type: gestureType, timestamp: now });
//       if (gestureHistory.current.length > 10) {
//         gestureHistory.current.shift();
//       }
      
//       console.log(`Gesture detected: ${gestureType}`);
      
//       // Execute callback from ref to avoid dependencies
//       const callback = callbacksRef.current[gestureType] || 
//                       (callbacksRef.current[`on${gestureType.charAt(0).toUpperCase() + gestureType.slice(1)}`]);
      
//       if (typeof callback === 'function') {
//         callback(transcript);
//       }
//     }
//   }, []);

//   // Process hand results and detect gestures
//   const processHandResults = useCallback((results) => {
//     if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
//       previousLandmarks.current = null;
//       return;
//     }

//     const currentLandmarks = results.multiHandLandmarks[0];
    
//     // Swipe detection
//     if (previousLandmarks.current) {
//       const wrist = currentLandmarks[0];
//       const prevWrist = previousLandmarks.current[0];
//       const dx = wrist.x - prevWrist.x;
//       const dy = wrist.y - prevWrist.y;
//       const threshold = 0.05;
//       const speed = Math.sqrt(dx * dx + dy * dy);

//       if (speed > threshold && !cooldownRef.current) {
//         cooldownRef.current = true;
//         if (Math.abs(dx) > Math.abs(dy)) {
//           if (dx > threshold) triggerGesture('swipeRight', 'swipe right');
//           else if (dx < -threshold) triggerGesture('swipeLeft', 'swipe left');
//         } else {
//           if (dy > threshold) triggerGesture('swipeDown', 'swipe down');
//           else if (dy < -threshold) triggerGesture('swipeUp', 'swipe up');
//         }
//         setTimeout(() => { cooldownRef.current = false; }, 500);
//       }
//     }

//     // Static gesture detection
//     if (detectPinch(currentLandmarks)) triggerGesture('pinch', 'pinch');
//     if (detectFist(currentLandmarks)) triggerGesture('fist', 'fist');
//     if (detectThumbsUp(currentLandmarks)) triggerGesture('thumbsUp', 'thumbs up');
//     if (detectPeaceSign(currentLandmarks)) triggerGesture('peaceSign', 'peace sign');
    
//     previousLandmarks.current = currentLandmarks;
//   }, [triggerGesture, detectPinch, detectFist, detectThumbsUp, detectPeaceSign]);

//   // Load MediaPipe components dynamically
//   const loadMediaPipeComponents = useCallback(async () => {
//     try {
//       const isElectron = window && window.process && window.process.versions?.electron;
      
//       if (isElectron) {
//         // Wait for global objects
//         await new Promise((resolve) => {
//           const checkMediaPipe = () => {
//             if (window.Hands && window.Camera) {
//               resolve();
//             } else {
//               setTimeout(checkMediaPipe, 100);
//             }
//           };
//           checkMediaPipe();
//         });
//       } else {
//         // Web environment - use CDN
//         try {
//           await Promise.all([
//             import('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'),
//             import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
//           ]);
//         } catch (importError) {
//           console.error('Failed to load MediaPipe:', importError);
//           throw new Error('MediaPipe not available');
//         }
//       }
//     } catch (err) {
//       console.error("Error loading MediaPipe:", err);
//       throw err;
//     }
//   }, []);

//   // Initialize MediaPipe Hands
//   const initializeHands = useCallback(async () => {
//     try {
//       await cleanup();
//       await loadMediaPipeComponents();

//       if (!window.Hands) throw new Error("Hands component not loaded");

//       const isElectron = window && window.process && window.process.versions?.electron;
//       const hands = new window.Hands({
//         locateFile: (file) => {
//           return isElectron 
//             ? `./mediapipe/hands/${file}`
//             : `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
//         }
//       });

//       hands.setOptions({
//         maxNumHands: 2,
//         modelComplexity: 1,
//         minDetectionConfidence: 0.7,
//         minTrackingConfidence: 0.7,
//       });

//       hands.onResults(processHandResults);
//       handsRef.current = hands;

//       await hands.initialize();
//       setIsInitialized(true);
//       setError(null);

//     } catch (err) {
//       console.error("Error initializing Hands:", err);
//       setError("Failed to initialize gesture detection");
//       setIsInitialized(false);
//     }
//   }, [cleanup, loadMediaPipeComponents, processHandResults]);

//   // Start webcam
//   const startWebcam = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480, facingMode: "user" }
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
        
//         await new Promise((resolve) => {
//           if (videoRef.current.readyState >= 3) resolve();
//           else videoRef.current.onloadedmetadata = resolve;
//         });

//         if (!window.Camera) throw new Error("Camera utils not loaded");

//         cameraRef.current = new window.Camera(videoRef.current, {
//           onFrame: async () => {
//             if (handsRef.current && videoRef.current.readyState === 4) {
//               try {
//                 await handsRef.current.send({ image: videoRef.current });
//               } catch (frameErr) {
//                 console.warn("Frame processing error:", frameErr);
//               }
//             }
//           },
//           width: 640,
//           height: 480
//         });

//         await cameraRef.current.start();
//       }
//     } catch (err) {
//       console.error("Webcam error:", err);
//       setError("Cannot access webcam");
//     }
//   }, []);

//   // Main initialization
//   useEffect(() => {
//     let isMounted = true;

//     const init = async () => {
//       try {
//         await initializeHands();
//         if (isMounted) await startWebcam();
//       } catch (err) {
//         if (isMounted) console.error("Gesture initialization failed:", err);
//       }
//     };

//     const hasCallbacks = Object.values(callbacksRef.current).some(callback => callback);
//     if (hasCallbacks) init();

//     return () => {
//       isMounted = false;
//       cleanup();
//     };
//   }, [initializeHands, startWebcam, cleanup]);

//   const restart = useCallback(async () => {
//     setError(null);
//     try {
//       await cleanup();
//       await initializeHands();
//       await startWebcam();
//     } catch (err) {
//       setError("Failed to restart");
//     }
//   }, [cleanup, initializeHands, startWebcam]);

//   return { 
//     videoRef, 
//     error, 
//     isInitialized, 
//     restart,
//     currentGesture: gestureHistory.current[gestureHistory.current.length - 1]?.type 
//   };
// };

// export default useGesture;


// hooks/useGesture.js
import { useEffect, useRef, useCallback, useState } from "react";

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

// Store callbacks in refs to avoid dependency issues
const callbacksRef = useRef({
onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
onPinch, onFist, onThumbsUp, onPeaceSign
});

// Update callbacks ref when they change
useEffect(() => {
callbacksRef.current = {
onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
onPinch, onFist, onThumbsUp, onPeaceSign
};
}, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onFist, onThumbsUp, onPeaceSign]);

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

// Static gesture detectors (moved outside to avoid dependencies)
const detectPinch = useCallback((landmarks) => {
const thumbTip = landmarks[4];
const indexTip = landmarks[8];
const distance = Math.sqrt(
Math.pow(thumbTip.x - indexTip.x, 2) +
Math.pow(thumbTip.y - indexTip.y, 2)
);
return distance < 0.05;
}, []);

const detectFist = useCallback((landmarks) => {
const fingerTips = [4, 8, 12, 16, 20];
const fingerBases = [2, 5, 9, 13, 17];

let curledCount = 0;
for (let i = 0; i < fingerTips.length; i++) {
if (landmarks[fingerTips[i]].y > landmarks[fingerBases[i]].y) {
curledCount++;
}
}
return curledCount >= 4;
}, []);

const detectThumbsUp = useCallback((landmarks) => {
const thumbTip = landmarks[4];
const thumbIp = landmarks[3];
const thumbMp = landmarks[2];

const thumbExtended = thumbTip.y < thumbIp.y && thumbIp.y < thumbMp.y;

const otherFingersCurled = [8, 12, 16, 20].every(tip =>
landmarks[tip].y > landmarks[tip - 2].y
);

return thumbExtended && otherFingersCurled;
}, []);

const detectPeaceSign = useCallback((landmarks) => {
const indexExtended = landmarks[8].y < landmarks[6].y;
const middleExtended = landmarks[12].y < landmarks[10].y;
const ringCurled = landmarks[16].y > landmarks[14].y;
const pinkyCurled = landmarks[20].y > landmarks[18].y;
const thumbCurled = landmarks[4].y > landmarks[3].y;

return indexExtended && middleExtended && ringCurled && pinkyCurled && thumbCurled;
}, []);

// Gesture triggering with cooldown and history
const triggerGesture = useCallback((gestureType, transcript) => {
const now = Date.now();

const recentGesture = gestureHistory.current.find(
g => g.type === gestureType && now - g.timestamp < 1000
);

if (!recentGesture) {
gestureHistory.current.push({ type: gestureType, timestamp: now });
if (gestureHistory.current.length > 10) {
gestureHistory.current.shift();
}

console.log(`Gesture detected: ${gestureType}`);

// Execute callback from ref to avoid dependencies
const callback = callbacksRef.current[gestureType] ||
(callbacksRef.current[`on${gestureType.charAt(0).toUpperCase() + gestureType.slice(1)}`]);

if (typeof callback === 'function') {
callback(transcript);
}
}
}, []);

// Process hand results and detect gestures
const processHandResults = useCallback((results) => {
if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
previousLandmarks.current = null;
return;
}

const currentLandmarks = results.multiHandLandmarks[0];

// Swipe detection
if (previousLandmarks.current) {
const wrist = currentLandmarks[0];
const prevWrist = previousLandmarks.current[0];
const dx = wrist.x - prevWrist.x;
const dy = wrist.y - prevWrist.y;
const threshold = 0.05;
const speed = Math.sqrt(dx * dx + dy * dy);

if (speed > threshold && !cooldownRef.current) {
cooldownRef.current = true;
if (Math.abs(dx) > Math.abs(dy)) {
if (dx > threshold) triggerGesture('swipeRight', 'swipe right');
else if (dx < -threshold) triggerGesture('swipeLeft', 'swipe left');
} else {
if (dy > threshold) triggerGesture('swipeDown', 'swipe down');
else if (dy < -threshold) triggerGesture('swipeUp', 'swipe up');
}
setTimeout(() => { cooldownRef.current = false; }, 500);
}
}

// Static gesture detection
if (detectPinch(currentLandmarks)) triggerGesture('pinch', 'pinch');
if (detectFist(currentLandmarks)) triggerGesture('fist', 'fist');
if (detectThumbsUp(currentLandmarks)) triggerGesture('thumbsUp', 'thumbs up');
if (detectPeaceSign(currentLandmarks)) triggerGesture('peaceSign', 'peace sign');

previousLandmarks.current = currentLandmarks;
}, [triggerGesture, detectPinch, detectFist, detectThumbsUp, detectPeaceSign]);

// Load MediaPipe components dynamically
const loadMediaPipeComponents = useCallback(async () => {
try {
const isElectron = window && window.process && window.process.versions?.electron;

if (isElectron) {
// Wait for global objects
await new Promise((resolve) => {
const checkMediaPipe = () => {
if (window.Hands && window.Camera) {
resolve();
} else {
setTimeout(checkMediaPipe, 100);
}
};
checkMediaPipe();
});
} else {
// Web environment - use CDN
try {
await Promise.all([
import('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'),
import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
]);
} catch (importError) {
console.error('Failed to load MediaPipe:', importError);
throw new Error('MediaPipe not available');
}
}
} catch (err) {
console.error("Error loading MediaPipe:", err);
throw err;
}
}, []);

// Initialize MediaPipe Hands
const initializeHands = useCallback(async () => {
try {
await cleanup();
await loadMediaPipeComponents();

if (!window.Hands) throw new Error("Hands component not loaded");

const isElectron = window && window.process && window.process.versions?.electron;
const hands = new window.Hands({
locateFile: (file) => {
return isElectron
? `./mediapipe/hands/${file}`
: `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
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
}
}, [cleanup, loadMediaPipeComponents, processHandResults]);

// Start webcam
const startWebcam = useCallback(async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({
video: { width: 640, height: 480, facingMode: "user" }
});

if (videoRef.current) {
videoRef.current.srcObject = stream;

await new Promise((resolve) => {
if (videoRef.current.readyState >= 3) resolve();
else videoRef.current.onloadedmetadata = resolve;
});

if (!window.Camera) throw new Error("Camera utils not loaded");

cameraRef.current = new window.Camera(videoRef.current, {
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
setError("Cannot access webcam");
}
}, []);

// Main initialization
useEffect(() => {
let isMounted = true;

const init = async () => {
try {
await initializeHands();
if (isMounted) await startWebcam();
} catch (err) {
if (isMounted) console.error("Gesture initialization failed:", err);
}
};

const hasCallbacks = Object.values(callbacksRef.current).some(callback => callback);
if (hasCallbacks) init();

return () => {
isMounted = false;
cleanup();
};
}, [initializeHands, startWebcam, cleanup]);

const restart = useCallback(async () => {
setError(null);
try {
await cleanup();
await initializeHands();
await startWebcam();
} catch (err) {
setError("Failed to restart");
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