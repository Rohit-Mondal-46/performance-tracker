
// import { useEffect, useRef, useState, useCallback } from "react";
// import { Holistic } from "@mediapipe/holistic";
// import { Camera } from "@mediapipe/camera_utils";

// const useHolistic = (onResults) => {
//   const videoRef = useRef(null);
//   const holisticRef = useRef(null);
//   const cameraRef = useRef(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [error, setError] = useState(null);

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
//       if (holisticRef.current) {
//         await holisticRef.current.close();
//         holisticRef.current = null;
//       }
//       setIsInitialized(false);
//     } catch (err) {
//       console.warn("Cleanup error:", err);
//     }
//   }, []);

//   // Initialize MediaPipe Holistic with CDN
//   const initializeHolistic = useCallback(async () => {
//     try {
//       await cleanup();

//       // Use CDN instead of local files to avoid WASM issues
//       const holistic = new Holistic({
//         locateFile: (file) => {
//           return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
//         }
//       });

//       holistic.setOptions({
//         modelComplexity: 0,
//         smoothLandmarks: true,
//         enableSegmentation: false,
//         smoothSegmentation: false,
//         refineFaceLandmarks: false,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       });

//       holistic.onResults(onResults);
//       holisticRef.current = holistic;

//       await holistic.initialize();
//       setIsInitialized(true);
//       setError(null);

//     } catch (err) {
//       console.error("Error initializing Holistic:", err);
//       setError("Failed to initialize pose detection. Please check your internet connection.");
//       setIsInitialized(false);
//       throw err;
//     }
//   }, [onResults, cleanup]);

//   // Start webcam
//   const startWebcam = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 480 },
//           height: { ideal: 360 },
//           facingMode: "user"
//         }
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
        
//         // Wait for video to load
//         await new Promise((resolve) => {
//           if (videoRef.current.readyState >= 3) {
//             resolve();
//           } else {
//             videoRef.current.onloadedmetadata = resolve;
//           }
//         });

//         // Start camera processing
//         cameraRef.current = new Camera(videoRef.current, {
//           onFrame: async () => {
//             if (holisticRef.current && videoRef.current.readyState === 4) {
//               try {
//                 await holisticRef.current.send({ image: videoRef.current });
//               } catch (frameErr) {
//                 console.warn("Frame error:", frameErr);
//               }
//             }
//           },
//           width: 480,
//           height: 360
//         });

//         await cameraRef.current.start();
//       }
//     } catch (err) {
//       console.error("Webcam error:", err);
//       setError("Cannot access webcam. Please check permissions.");
//       throw err;
//     }
//   }, []);

//   // Main initialization effect
//   useEffect(() => {
//     let isMounted = true;

//     const init = async () => {
//       try {
//         await initializeHolistic();
//         if (isMounted) {
//           await startWebcam();
//         }
//       } catch (err) {
//         if (isMounted) {
//           console.error("Initialization failed:", err);
//         }
//       }
//     };

//     if (onResults) {
//       init();
//     }

//     return () => {
//       isMounted = false;
//       cleanup();
//     };
//   }, [onResults]);

//   const restart = useCallback(async () => {
//     setError(null);
//     try {
//       await cleanup();
//       await initializeHolistic();
//       await startWebcam();
//     } catch (err) {
//       setError("Failed to restart. Please refresh the page.");
//     }
//   }, [cleanup, initializeHolistic, startWebcam]);

//   return { videoRef, error, isInitialized, restart };
// };

// export default useHolistic;



import { useEffect, useRef, useState, useCallback } from "react";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

// To track previous hand positions
let previousLeftWrist = null;
let previousRightWrist = null;
const MOVEMENT_THRESHOLD = 0.01;

// Helper functions for activity classification
const distance = (a, b) =>
  Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  );

const isHandNearDesk = (hand, pose) => {
  if (!hand || !pose || hand.length === 0) return false;
  const wrist = hand[0];
  const chest = pose[11];
  return wrist && chest && wrist.y > chest.y + 0.05;
};

const isHandNearHead = (hand, pose) => {
  if (!hand || !pose || hand.length === 0) return false;
  const wrist = hand[0];
  const head = pose[0];
  return wrist && head && wrist.y < head.y + 0.05;
};

const isHandMoving = (hand, side) => {
  if (!hand || hand.length === 0) return false;

  const wrist = hand[0];
  let prevWrist = side === 'left' ? previousLeftWrist : previousRightWrist;

  if (side === 'left') previousLeftWrist = wrist;
  else previousRightWrist = wrist;

  if (!prevWrist) return true;

  const dist = distance(wrist, prevWrist);
  return dist > MOVEMENT_THRESHOLD;
};

/**
 * Classify activity based on MediaPipe Holistic results
 */
const classifyActivity = (results) => {
  if (!results || !results.poseLandmarks) {
    return 'No Data';
  }

  const leftHand = results.leftHandLandmarks || [];
  const rightHand = results.rightHandLandmarks || [];
  const pose = results.poseLandmarks;

  // --- TYPING ---
  const isTyping =
    isHandNearDesk(leftHand, pose) &&
    isHandNearDesk(rightHand, pose) &&
    (isHandMoving(leftHand, 'left') || isHandMoving(rightHand, 'right'));

  // --- READING ---
  const isReading =
    isHandNearHead(leftHand, pose) || isHandNearHead(rightHand, pose);

  // --- WRITING ---
  const isWriting =
    (isHandNearDesk(leftHand, pose) && isHandMoving(rightHand, 'right')) ||
    (isHandNearDesk(rightHand, pose) && isHandMoving(leftHand, 'left'));

  // Determine activity
  if (isTyping) return 'Typing';
  if (isWriting) return 'Writing';
  if (isReading) return 'Reading';
  return 'Idle';
};

const useHolistic = (onResults, onActivityChange) => {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const cameraRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState("Initializing...");

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
      if (holisticRef.current) {
        await holisticRef.current.close();
        holisticRef.current = null;
      }
      setIsInitialized(false);
      
      // Reset tracking variables
      previousLeftWrist = null;
      previousRightWrist = null;
      
    } catch (err) {
      console.warn("Cleanup error:", err);
    }
  }, []);

  // Process results and detect activity
  const processResults = useCallback((results) => {
    if (onResults) {
      onResults(results);
    }
    
    // Classify activity from the results
    const activity = classifyActivity(results);
    setCurrentActivity(activity);
    
    if (onActivityChange) {
      onActivityChange(activity);
    }
  }, [onResults, onActivityChange]);

  // Initialize MediaPipe Holistic
  const initializeHolistic = useCallback(async () => {
    try {
      await cleanup();

      // Use local files for Electron app
      const isElectron = window && window.process && window.process.versions?.electron;
      const holistic = new Holistic({
        locateFile: (file) => {
          if (isElectron) {
            // Electron: use local files
            return `file://${window.process.cwd()}/public/mediapipe/holistic/${file}`;
          } else {
            // Web: use CDN
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
          }
        }
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults(processResults);
      holisticRef.current = holistic;

      await holistic.initialize();
      setIsInitialized(true);
      setError(null);

    } catch (err) {
      console.error("Error initializing Holistic:", err);
      setError("Failed to initialize pose detection. " + 
        (window.process?.versions?.electron 
          ? "Check if MediaPipe files are in public/mediapipe/holistic/"
          : "Please check your internet connection."
        ));
      setIsInitialized(false);
      throw err;
    }
  }, [cleanup, processResults]);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          if (videoRef.current.readyState >= 3) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = resolve;
            videoRef.current.onerror = reject;
          }
        });

        // Add small delay to ensure video is ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Start camera processing
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (holisticRef.current && videoRef.current?.readyState === 4) {
              try {
                await holisticRef.current.send({ image: videoRef.current });
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
      setError("Cannot access webcam. Please check permissions.");
      throw err;
    }
  }, []);

  // Main initialization effect
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await initializeHolistic();
        if (isMounted) {
          await startWebcam();
        }
      } catch (err) {
        if (isMounted) {
          console.error("Initialization failed:", err);
        }
      }
    };

    // Only initialize if we have at least one callback
    if (onResults || onActivityChange) {
      init();
    }

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [onResults, onActivityChange]);

  const restart = useCallback(async () => {
    setError(null);
    setCurrentActivity("Restarting...");
    try {
      await cleanup();
      await initializeHolistic();
      await startWebcam();
    } catch (err) {
      setError("Failed to restart. Please refresh the page.");
    }
  }, [cleanup, initializeHolistic, startWebcam]);

  return { 
    videoRef, 
    error, 
    isInitialized, 
    currentActivity,
    restart 
  };
};

export default useHolistic;
export { classifyActivity };